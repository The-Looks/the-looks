package vn.thelooks.billing;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;

/** Ranh giới các layer (domain → application → api/infrastructure), kiểm tra trên CI. */
@AnalyzeClasses(packages = "vn.thelooks.billing", importOptions = ImportOption.DoNotIncludeTests.class)
class ArchitectureTest {

    @ArchTest
    static final ArchRule domainIsFrameworkFree = noClasses()
            .that().resideInAPackage("vn.thelooks.billing.domain..")
            .should().dependOnClassesThat().resideInAnyPackage(
                    "org.springframework..", "jakarta.persistence..",
                    "vn.thelooks.billing.application..", "vn.thelooks.billing.api..", "vn.thelooks.billing.infrastructure..")
            .allowEmptyShould(true);

    @ArchTest
    static final ArchRule applicationDoesNotDependOnAdapters = noClasses()
            .that().resideInAPackage("vn.thelooks.billing.application..")
            .should().dependOnClassesThat().resideInAnyPackage("vn.thelooks.billing.api..", "vn.thelooks.billing.infrastructure..")
            .allowEmptyShould(true);

    @ArchTest
    static final ArchRule apiDoesNotUseInfrastructure = noClasses()
            .that().resideInAPackage("vn.thelooks.billing.api..")
            .should().dependOnClassesThat().resideInAPackage("vn.thelooks.billing.infrastructure..")
            .allowEmptyShould(true);
}
