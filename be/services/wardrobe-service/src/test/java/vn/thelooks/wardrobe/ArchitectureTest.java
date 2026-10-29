package vn.thelooks.wardrobe;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;

/** Ranh giới các layer (domain → application → api/infrastructure), kiểm tra trên CI. */
@AnalyzeClasses(packages = "vn.thelooks.wardrobe", importOptions = ImportOption.DoNotIncludeTests.class)
class ArchitectureTest {

    @ArchTest
    static final ArchRule domainIsFrameworkFree = noClasses()
            .that().resideInAPackage("vn.thelooks.wardrobe.domain..")
            .should().dependOnClassesThat().resideInAnyPackage(
                    "org.springframework..", "jakarta.persistence..",
                    "vn.thelooks.wardrobe.application..", "vn.thelooks.wardrobe.api..", "vn.thelooks.wardrobe.infrastructure..")
            .allowEmptyShould(true);

    @ArchTest
    static final ArchRule applicationDoesNotDependOnAdapters = noClasses()
            .that().resideInAPackage("vn.thelooks.wardrobe.application..")
            .should().dependOnClassesThat().resideInAnyPackage("vn.thelooks.wardrobe.api..", "vn.thelooks.wardrobe.infrastructure..")
            .allowEmptyShould(true);

    @ArchTest
    static final ArchRule apiDoesNotUseInfrastructure = noClasses()
            .that().resideInAPackage("vn.thelooks.wardrobe.api..")
            .should().dependOnClassesThat().resideInAPackage("vn.thelooks.wardrobe.infrastructure..")
            .allowEmptyShould(true);
}
