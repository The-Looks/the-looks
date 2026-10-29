package vn.thelooks.voting;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;

/** Ranh giới các layer (domain → application → api/infrastructure), kiểm tra trên CI. */
@AnalyzeClasses(packages = "vn.thelooks.voting", importOptions = ImportOption.DoNotIncludeTests.class)
class ArchitectureTest {

    @ArchTest
    static final ArchRule domainIsFrameworkFree = noClasses()
            .that().resideInAPackage("vn.thelooks.voting.domain..")
            .should().dependOnClassesThat().resideInAnyPackage(
                    "org.springframework..", "jakarta.persistence..",
                    "vn.thelooks.voting.application..", "vn.thelooks.voting.api..", "vn.thelooks.voting.infrastructure..")
            .allowEmptyShould(true);

    @ArchTest
    static final ArchRule applicationDoesNotDependOnAdapters = noClasses()
            .that().resideInAPackage("vn.thelooks.voting.application..")
            .should().dependOnClassesThat().resideInAnyPackage("vn.thelooks.voting.api..", "vn.thelooks.voting.infrastructure..")
            .allowEmptyShould(true);

    @ArchTest
    static final ArchRule apiDoesNotUseInfrastructure = noClasses()
            .that().resideInAPackage("vn.thelooks.voting.api..")
            .should().dependOnClassesThat().resideInAPackage("vn.thelooks.voting.infrastructure..")
            .allowEmptyShould(true);
}
