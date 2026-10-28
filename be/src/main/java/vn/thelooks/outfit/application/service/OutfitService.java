package vn.thelooks.outfit.application.service;

import java.net.URI;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.thelooks.outfit.OutfitApi;
import vn.thelooks.outfit.OutfitView;
import vn.thelooks.outfit.application.port.in.GetOutfitsQuery;
import vn.thelooks.outfit.application.port.in.MarkOutfitWornUseCase;
import vn.thelooks.outfit.application.port.in.QuickPickUseCase;
import vn.thelooks.outfit.application.port.in.SaveOutfitUseCase;
import vn.thelooks.outfit.application.port.in.SuggestOutfitsUseCase;
import vn.thelooks.outfit.application.port.out.OutfitAiAdvisor;
import vn.thelooks.outfit.application.port.out.OutfitRepository;
import vn.thelooks.outfit.application.port.out.WardrobeReader;
import vn.thelooks.outfit.application.port.out.WearLogRepository;
import vn.thelooks.outfit.domain.ClosetItem;
import vn.thelooks.outfit.domain.Occasion;
import vn.thelooks.outfit.domain.Outfit;
import vn.thelooks.outfit.domain.OutfitRecommender;
import vn.thelooks.outfit.domain.OutfitSuggestion;
import vn.thelooks.outfit.domain.WearLog;

@Service
@Transactional(readOnly = true)
class OutfitService implements SuggestOutfitsUseCase, QuickPickUseCase, SaveOutfitUseCase,
        MarkOutfitWornUseCase, GetOutfitsQuery, OutfitApi {

    static final ZoneId VIETNAM = ZoneId.of("Asia/Ho_Chi_Minh");
    /** Số ứng viên tốt nhất gửi cho AI chọn lại. */
    static final int AI_CANDIDATES = 20;
    static final int MAX_ITEMS_PER_OUTFIT = 10;

    private final WardrobeReader wardrobe;
    private final OutfitRepository outfits;
    private final WearLogRepository wearLogs;
    private final OutfitAiAdvisor aiAdvisor;
    private final Clock clock;
    private final OutfitRecommender recommender = new OutfitRecommender();

    OutfitService(WardrobeReader wardrobe, OutfitRepository outfits, WearLogRepository wearLogs,
            OutfitAiAdvisor aiAdvisor, Clock clock) {
        this.wardrobe = wardrobe;
        this.outfits = outfits;
        this.wearLogs = wearLogs;
        this.aiAdvisor = aiAdvisor;
        this.clock = clock;
    }

    @Override
    public List<OutfitSuggestion> suggest(UUID ownerId, Occasion occasion, int limit) {
        if (occasion == null) {
            throw new IllegalArgumentException("Cần chọn dịp");
        }
        return aiAdvisor.choose(occasion, candidates(ownerId, occasion), limit);
    }

    @Override
    public Optional<OutfitSuggestion> quickPick(UUID ownerId) {
        return aiAdvisor.choose(null, candidates(ownerId, null), 1).stream().findFirst();
    }

    private List<OutfitSuggestion> candidates(UUID ownerId, Occasion occasion) {
        Instant now = clock.instant();
        String season = OutfitRecommender.seasonOf(LocalDate.ofInstant(now, VIETNAM).getMonth());
        return recommender.recommend(wardrobe.confirmedItems(ownerId), wearLogs.lastWornAtByItem(ownerId),
                occasion, now, season, AI_CANDIDATES);
    }

    @Override
    @Transactional
    public Outfit save(UUID ownerId, List<UUID> itemIds, Occasion occasion) {
        if (itemIds == null || itemIds.isEmpty() || itemIds.size() > MAX_ITEMS_PER_OUTFIT) {
            throw new IllegalArgumentException("Outfit cần từ 1 đến " + MAX_ITEMS_PER_OUTFIT + " món");
        }
        if (new HashSet<>(itemIds).size() != itemIds.size()) {
            throw new IllegalArgumentException("Outfit có món bị trùng");
        }
        Set<UUID> owned = wardrobe.confirmedItems(ownerId).stream().map(ClosetItem::id).collect(Collectors.toSet());
        if (!owned.containsAll(itemIds)) {
            throw new IllegalArgumentException("Có món không nằm trong tủ đồ của bạn");
        }
        return outfits.save(new Outfit(UUID.randomUUID(), ownerId, List.copyOf(itemIds), occasion, clock.instant()));
    }

    @Override
    @Transactional
    public void markWorn(UUID ownerId, UUID outfitId) {
        Outfit outfit = owned(ownerId, outfitId).orElseThrow(() -> new NoSuchElementException("Không tìm thấy outfit"));
        wearLogs.save(new WearLog(UUID.randomUUID(), ownerId, outfitId, outfit.itemIds(), clock.instant()));
    }

    @Override
    public List<Outfit> mine(UUID ownerId) {
        return outfits.findByOwner(ownerId);
    }

    /** OutfitApi cho module voting. Món đã bị xoá khỏi tủ thì bỏ qua ảnh của món đó. */
    @Override
    public Optional<OutfitView> find(UUID ownerId, UUID outfitId) {
        return owned(ownerId, outfitId).map(outfit -> {
            Map<UUID, ClosetItem> closet = wardrobe.confirmedItems(ownerId).stream()
                    .collect(Collectors.toMap(ClosetItem::id, Function.identity()));
            List<URI> images = outfit.itemIds().stream()
                    .map(closet::get)
                    .filter(item -> item != null && item.imageUrl() != null)
                    .map(ClosetItem::imageUrl)
                    .toList();
            return new OutfitView(outfit.id(), images);
        });
    }

    private Optional<Outfit> owned(UUID ownerId, UUID outfitId) {
        return outfits.findById(outfitId).filter(o -> o.ownerId().equals(ownerId));
    }
}
