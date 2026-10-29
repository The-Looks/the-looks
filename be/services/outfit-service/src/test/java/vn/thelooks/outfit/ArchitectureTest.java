package vn.thelooks.outfit;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;

/** Ranh giới các layer (domain → application → api/infrastructure), kiểm tra trên CI. */
@AnalyzeClasses(packages = "vn.thelooks.outfit", importOptions = ImportOption.DoNotIncludeTests.class)
class ArchitectureTest {

    @ArchTest
    static final ArchRule domainIsFrameworkFree = noClasses()
            .that().resideInAPackage("vn.thelooks.outfit.domain..")
            .should().dependOnClassesThat().resideInAnyPackage(
                    "org.springframework..", "jakarta.persistence..",
                    "vn.thelooks.outfit.application..", "vn.thelooks.outfit.api..", "vn.thelooks.outfit.infrastructure..")
            .allowEmptyShould(true);

    @ArchTest
    static final ArchRule applicationDoesNotDependOnAdapters = noClasses()
            .that().resideInAPackage("vn.thelooks.outfit.application..")
            .should().dependOnClassesThat().resideInAnyPackage("vn.thelooks.outfit.api..", "vn.thelooks.outfit.infrastructure..")
            .allowEmptyShould(true);

    @ArchTest
    static final ArchRule apiDoesNotUseInfrastructure = noClasses()
            .that().resideInAPackage("vn.thelooks.outfit.api..")
            .should().dependOnClassesThat().resideInAPackage("vn.thelooks.outfit.infrastructure..")
            .allowEmptyShould(true);
}
