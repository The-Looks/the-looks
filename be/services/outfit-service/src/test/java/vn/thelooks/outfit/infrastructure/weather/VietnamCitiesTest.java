package vn.thelooks.outfit.infrastructure.weather;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class VietnamCitiesTest {

    @Test
    void findsTheWebDropdownNamesAndCommonSpellings() {
        var hcm = VietnamCities.find("TP. Hồ Chí Minh").orElseThrow();
        assertThat(VietnamCities.find("Thành phố Hồ Chí Minh")).contains(hcm);
        assertThat(VietnamCities.find("tp.hcm")).contains(hcm);
        assertThat(VietnamCities.find("Sài Gòn")).contains(hcm);
        assertThat(VietnamCities.find("Đắk Lắk")).isPresent();
        assertThat(VietnamCities.find("  hà nội ")).isPresent();
        assertThat(VietnamCities.find("Sa Pa")).isEmpty(); // ngoài bảng: tra địa danh như cũ
    }

    @Test
    void coversAll34ProvincialUnits() {
        String[] web = {"TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Hải Phòng", "Cần Thơ", "Huế", "An Giang", "Bắc Ninh", "Cà Mau",
            "Cao Bằng", "Đắk Lắk", "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Tĩnh", "Hưng Yên", "Khánh Hòa",
            "Lai Châu", "Lâm Đồng", "Lạng Sơn", "Lào Cai", "Nghệ An", "Ninh Bình", "Phú Thọ", "Quảng Ngãi", "Quảng Ninh",
            "Quảng Trị", "Sơn La", "Tây Ninh", "Thái Nguyên", "Thanh Hóa", "Tuyên Quang", "Vĩnh Long"};
        assertThat(web).hasSize(34).allSatisfy(city -> assertThat(VietnamCities.find(city)).as(city).isPresent());
    }
}
