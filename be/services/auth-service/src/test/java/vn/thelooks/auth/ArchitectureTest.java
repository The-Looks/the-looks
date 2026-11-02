package vn.thelooks.auth;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;

/** Ranh giới các layer (domain → application → presentation/infrastructure), kiểm tra trên CI. */
@AnalyzeClasses(packages = "vn.thelooks.auth", importOptions = ImportOption.DoNotIncludeTests.class)
class ArchitectureTest {

    @ArchTest
    static final ArchRule domainIsFrameworkFree = noClasses()
            .that().resideInAPackage("vn.thelooks.auth.domain..")
            .should().dependOnClassesThat().resideInAnyPackage(
                    "org.springframework..", "jakarta.persistence..",
                    "vn.thelooks.auth.application..", "vn.thelooks.auth.presentation..", "vn.thelooks.auth.infrastructure..")
            .allowEmptyShould(true);

    @ArchTest
    static final ArchRule applicationDoesNotDependOnAdapters = noClasses()
            .that().resideInAPackage("vn.thelooks.auth.application..")
            .should().dependOnClassesThat().resideInAnyPackage("vn.thelooks.auth.presentation..", "vn.thelooks.auth.infrastructure..")
            .allowEmptyShould(true);

    @ArchTest
    static final ArchRule presentationDoesNotUseInfrastructure = noClasses()
            .that().resideInAPackage("vn.thelooks.auth.presentation..")
            .should().dependOnClassesThat().resideInAPackage("vn.thelooks.auth.infrastructure..")
            .allowEmptyShould(true);
}
