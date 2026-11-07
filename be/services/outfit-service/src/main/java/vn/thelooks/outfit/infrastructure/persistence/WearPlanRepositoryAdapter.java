package vn.thelooks.outfit.infrastructure.persistence;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Component;
import vn.thelooks.outfit.application.port.out.WearPlanRepository;

@Component
class WearPlanRepositoryAdapter implements WearPlanRepository {

    private final JdbcClient jdbc;

    WearPlanRepositoryAdapter(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public void plan(UUID ownerId, LocalDate date, UUID outfitId) {
        jdbc.sql("""
                insert into outfit_wear_plan (owner_id, plan_date, outfit_id) values (:owner, :date, :outfit)
                on conflict (owner_id, plan_date) do update set outfit_id = excluded.outfit_id, created_at = now()
                """).param("owner", ownerId).param("date", date).param("outfit", outfitId).update();
    }

    @Override
    public void unplan(UUID ownerId, LocalDate date) {
        jdbc.sql("delete from outfit_wear_plan where owner_id = :owner and plan_date = :date")
                .param("owner", ownerId).param("date", date).update();
    }

    @Override
    public Map<LocalDate, UUID> plans(UUID ownerId, LocalDate from, LocalDate to) {
        Map<LocalDate, UUID> result = new LinkedHashMap<>();
        jdbc.sql("""
                select plan_date, outfit_id from outfit_wear_plan
                where owner_id = :owner and plan_date between :from and :to order by plan_date
                """).param("owner", ownerId).param("from", from).param("to", to)
                .query(rs -> {
                    result.put(rs.getObject("plan_date", LocalDate.class), rs.getObject("outfit_id", UUID.class));
                });
        return result;
    }

    /** Ngày mặc tính theo giờ Việt Nam: 23:30 ngày 1 giờ VN vẫn là ngày 1. */
    @Override
    public List<Worn> worn(UUID ownerId, LocalDate from, LocalDate to) {
        return jdbc.sql("""
                select (worn_at at time zone 'Asia/Ho_Chi_Minh')::date as day, outfit_id from outfit_wear_log
                where owner_id = :owner
                  and worn_at >= (cast(:from as date)::timestamp at time zone 'Asia/Ho_Chi_Minh')
                  and worn_at < ((cast(:to as date) + 1)::timestamp at time zone 'Asia/Ho_Chi_Minh')
                order by worn_at
                """).param("owner", ownerId).param("from", from).param("to", to)
                .query((rs, n) -> new Worn(rs.getObject("day", LocalDate.class), rs.getObject("outfit_id", UUID.class)))
                .list();
    }
}
