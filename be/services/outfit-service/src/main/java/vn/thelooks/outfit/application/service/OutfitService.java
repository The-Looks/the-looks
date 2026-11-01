package vn.thelooks.outfit.application.service;

import java.net.URI;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import vn.thelooks.outfit.application.port.out.AiUsageRepository;
import vn.thelooks.outfit.application.port.out.FeedbackRepository;
import vn.thelooks.outfit.application.port.out.OutfitAiAdvisor;
import vn.thelooks.outfit.application.port.out.OutfitRepository;
import vn.thelooks.outfit.application.port.out.WardrobeReader;
import vn.thelooks.outfit.application.port.out.WeatherReader;
import vn.thelooks.outfit.application.port.out.WearLogRepository;
import vn.thelooks.outfit.application.usecase.GetAiUsageQuery;
import vn.thelooks.outfit.application.usecase.GetOutfitsQuery;
import vn.thelooks.outfit.application.usecase.MarkOutfitWornUseCase;
import vn.thelooks.outfit.application.usecase.QuickPickUseCase;
import vn.thelooks.outfit.application.usecase.RateSuggestionUseCase;
import vn.thelooks.outfit.application.usecase.SaveOutfitUseCase;
import vn.thelooks.outfit.application.usecase.SuggestOutfitsUseCase;
import vn.thelooks.outfit.domain.exception.InvalidOutfitException;
import vn.thelooks.outfit.domain.exception.OutfitNotFoundException;
import vn.thelooks.outfit.domain.model.ClosetItem;
import vn.thelooks.outfit.domain.model.Feedback;
import vn.thelooks.outfit.domain.model.Occasion;
import vn.thelooks.outfit.domain.model.Outfit;
import vn.thelooks.outfit.domain.model.OutfitSuggestion;
import vn.thelooks.outfit.domain.model.OutfitView;
import vn.thelooks.outfit.domain.model.StyleProfile;
import vn.thelooks.outfit.domain.model.Weather;
import vn.thelooks.outfit.domain.model.WearLog;
import vn.thelooks.outfit.domain.service.OutfitRecommender;

@Service
@Transactional(readOnly = true)
class OutfitService implements SuggestOutfitsUseCase, QuickPickUseCase, SaveOutfitUseCase,
        MarkOutfitWornUseCase, GetOutfitsQuery, RateSuggestionUseCase, GetAiUsageQuery {

    static final ZoneId VIETNAM = ZoneId.of("Asia/Ho_Chi_Minh");
    /** Số ứng viên tốt nhất gửi cho AI chọn lại. */
    static final int AI_CANDIDATES = 20;
    static final int MAX_ITEMS_PER_OUTFIT = 10;

    private final WardrobeReader wardrobe;
    private final OutfitRepository outfits;
    private final WearLogRepository wearLogs;
    private final OutfitAiAdvisor aiAdvisor;
    private final FeedbackRepository feedback;
    private final WeatherReader weather;
    private final AiUsageRepository aiUsage;
    private final int aiDailyLimitPerUser;
    private final double aiMonthlyBudgetUsd;
    private final Clock clock;
    private final OutfitRecommender recommender = new OutfitRecommender();

    OutfitService(WardrobeReader wardrobe, OutfitRepository outfits, WearLogRepository wearLogs,
            OutfitAiAdvisor aiAdvisor, FeedbackRepository feedback, WeatherReader weather, AiUsageRepository aiUsage,
            @Value("${thelooks.ai.daily-limit-per-user}") int aiDailyLimitPerUser,
            @Value("${thelooks.ai.monthly-budget-usd}") double aiMonthlyBudgetUsd,
            Clock clock) {
        this.wardrobe = wardrobe;
        this.outfits = outfits;
        this.wearLogs = wearLogs;
        this.aiAdvisor = aiAdvisor;
        this.feedback = feedback;
        this.weather = weather;
        this.aiUsage = aiUsage;
        this.aiDailyLimitPerUser = aiDailyLimitPerUser;
        this.aiMonthlyBudgetUsd = aiMonthlyBudgetUsd;
        this.clock = clock;
    }

    @Override
    @Transactional(propagation = Propagation.NOT_SUPPORTED) // gọi AI vài giây, không giữ kết nối DB
    public List<OutfitSuggestion> suggest(UUID ownerId, Occasion occasion, int limit) {
        if (occasion == null) {
            throw new InvalidOutfitException("Cần chọn dịp");
        }
        return advise(ownerId, occasion, prepare(ownerId, occasion), limit);
    }

    @Override
    @Transactional(propagation = Propagation.NOT_SUPPORTED) // gọi AI vài giây, không giữ kết nối DB
    public Optional<OutfitSuggestion> quickPick(UUID ownerId) {
        return advise(ownerId, null, prepare(ownerId, null), 1).stream().findFirst();
    }

    /**
     * Gọi AI trong giới hạn: mỗi người tối đa N lượt/ngày và tổng chi phí tháng chưa vượt ngân sách.
     * Hết lượt → vẫn có gợi ý theo điểm của OutfitRecommender, chỉ không qua AI.
     */
    private List<OutfitSuggestion> advise(UUID ownerId, Occasion occasion, Prepared prepared, int limit) {
        List<OutfitSuggestion> candidates = prepared.candidates();
        if (candidates.isEmpty()) {
            return List.of();
        }
        Instant now = clock.instant();
        boolean withinLimits = aiUsage.callsSince(ownerId, startOfDay(now)) < aiDailyLimitPerUser
                && aiUsage.costSince(startOfMonth(now)) < aiMonthlyBudgetUsd;
        if (!withinLimits) {
            return OutfitAiAdvisor.Advice.withoutAi(candidates, limit).suggestions();
        }
        OutfitAiAdvisor.Advice advice = aiAdvisor.choose(occasion, candidates, prepared.taste(), limit);
        if (advice.usage() != null) {
            aiUsage.record(ownerId, advice.usage(), now);
        }
        return advice.suggestions();
    }

    @Override
    public Report thisMonth() {
        Instant since = startOfMonth(clock.instant());
        return new Report(LocalDate.ofInstant(since, VIETNAM).toString().substring(0, 7),
                aiUsage.costSince(since), aiMonthlyBudgetUsd, aiUsage.topUsersSince(since, 10));
    }

    static Instant startOfDay(Instant now) {
        return LocalDate.ofInstant(now, VIETNAM).atStartOfDay(VIETNAM).toInstant();
    }

    static Instant startOfMonth(Instant now) {
        return LocalDate.ofInstant(now, VIETNAM).withDayOfMonth(1).atStartOfDay(VIETNAM).toInstant();
    }

    /** Ứng viên đã lọc + chấm điểm, kèm gu của người dùng để gửi cho AI. */
    record Prepared(List<OutfitSuggestion> candidates, StyleProfile taste) {
    }

    private Prepared prepare(UUID ownerId, Occasion occasion) {
        Instant now = clock.instant();
        Optional<Weather> today = weather.current();
        Set<String> seasons = today
                .map(w -> OutfitRecommender.seasonsFor(w.temperatureC()))
                .orElseGet(() -> Set.of(OutfitRecommender.seasonOf(LocalDate.ofInstant(now, VIETNAM).getMonth())));
        List<ClosetItem> closet = wardrobe.confirmedItems(ownerId);
        Map<String, Feedback> votes = feedback.byOwner(ownerId);
        StyleProfile taste = StyleProfile.learn(closet, votes, outfits.findByOwner(ownerId), wearLogs.wearCountByItem(ownerId));
        List<OutfitSuggestion> suggestions = recommender.recommend(closet, wearLogs.lastWornAtByItem(ownerId), votes, taste,
                occasion, now, seasons, AI_CANDIDATES);
        return new Prepared(today.map(w -> withWeatherNote(suggestions, w)).orElse(suggestions), taste);
    }

    /** Ghi thời tiết vào lý do gợi ý, ví dụ "… · Trời 33°C, có mưa". */
    static List<OutfitSuggestion> withWeatherNote(List<OutfitSuggestion> suggestions, Weather w) {
        String note = "Trời " + Math.round(w.temperatureC()) + "°C" + (w.rainy() ? ", có mưa" : "");
        return suggestions.stream()
                .map(s -> new OutfitSuggestion(s.items(), s.occasion(), s.score(), s.reason() + " · " + note))
                .toList();
    }

    @Override
    @Transactional
    public void rate(UUID ownerId, List<UUID> itemIds, Feedback vote) {
        validateItems(itemIds);
        if (vote == null) {
            throw new InvalidOutfitException("Cần chọn thích hoặc không thích");
        }
        feedback.save(ownerId, Feedback.comboKey(itemIds), vote, clock.instant());
    }

    @Override
    @Transactional
    public Outfit save(UUID ownerId, List<UUID> itemIds, Occasion occasion) {
        validateItems(itemIds);
        Set<UUID> owned = wardrobe.confirmedItems(ownerId).stream().map(ClosetItem::id).collect(Collectors.toSet());
        if (!owned.containsAll(itemIds)) {
            throw new InvalidOutfitException("Có món không nằm trong tủ đồ của bạn");
        }
        return outfits.save(new Outfit(UUID.randomUUID(), ownerId, List.copyOf(itemIds), occasion, clock.instant()));
    }

    @Override
    @Transactional
    public void markWorn(UUID ownerId, UUID outfitId) {
        Outfit outfit = owned(ownerId, outfitId).orElseThrow(() -> new OutfitNotFoundException("Không tìm thấy outfit"));
        wearLogs.save(new WearLog(UUID.randomUUID(), ownerId, outfitId, outfit.itemIds(), clock.instant()));
    }

    @Override
    public List<Outfit> mine(UUID ownerId) {
        return outfits.findByOwner(ownerId);
    }

    /** Món đã bị xoá khỏi tủ thì bỏ qua ảnh của món đó. */
    @Override
    public Optional<OutfitView> view(UUID ownerId, UUID outfitId) {
        return owned(ownerId, outfitId).map(outfit -> {
            Map<UUID, ClosetItem> closet = wardrobe.confirmedItems(ownerId).stream()
                    .collect(Collectors.toMap(ClosetItem::id, Function.identity()));
            List<URI> images = outfit.itemIds().stream()
                    .map(closet::get)
                    .filter(item -> item != null && item.imageUrl() != null)
                    .map(ClosetItem::imageUrl)
                    .toList();
            return new OutfitView(outfit, images);
        });
    }

    private static void validateItems(List<UUID> itemIds) {
        if (itemIds == null || itemIds.isEmpty() || itemIds.size() > MAX_ITEMS_PER_OUTFIT) {
            throw new InvalidOutfitException("Outfit cần từ 1 đến " + MAX_ITEMS_PER_OUTFIT + " món");
        }
        if (new HashSet<>(itemIds).size() != itemIds.size()) {
            throw new InvalidOutfitException("Outfit có món bị trùng");
        }
    }

    private Optional<Outfit> owned(UUID ownerId, UUID outfitId) {
        return outfits.findById(outfitId).filter(o -> o.ownerId().equals(ownerId));
    }
}
