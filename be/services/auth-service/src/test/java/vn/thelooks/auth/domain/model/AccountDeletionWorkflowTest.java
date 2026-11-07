package vn.thelooks.auth.domain.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;

class AccountDeletionWorkflowTest {
    @Test
    void retriesOnlyTheFailedStepAndFollowingSteps() {
        List<String> attempted = new ArrayList<>();
        var first = AccountDeletionWorkflow.run("VOTING", (step, next) -> {
            attempted.add(step);
            if (step.equals("OUTFIT")) throw new IllegalStateException("outfit unavailable");
        });
        assertFalse(first.completed());
        assertEquals("OUTFIT", first.step());
        assertEquals(List.of("VOTING", "WARDROBE", "OUTFIT"), attempted);

        attempted.clear();
        var retried = AccountDeletionWorkflow.run(first.step(), (step, next) -> attempted.add(step));
        assertTrue(retried.completed());
        assertEquals(List.of("OUTFIT", "BILLING", "AUTH"), attempted);
    }
}
