package vn.thelooks.auth.domain.model;

import java.util.List;

/** Ordered, resumable steps for deleting an account across services. */
public final class AccountDeletionWorkflow {
    private static final List<String> STEPS = List.of("VOTING", "WARDROBE", "OUTFIT", "BILLING", "AUTH");
    private AccountDeletionWorkflow() {}

    @FunctionalInterface
    public interface StepExecutor {
        void execute(String step, String nextStep);
    }

    public record Result(String step, RuntimeException failure) {
        public boolean completed() { return failure == null; }
    }

    public static Result run(String firstStep, StepExecutor executor) {
        int index = STEPS.indexOf(firstStep);
        if (index < 0) throw new IllegalArgumentException("Unknown deletion step: " + firstStep);
        for (int i = index; i < STEPS.size(); i++) {
            String step = STEPS.get(i);
            String next = i + 1 < STEPS.size() ? STEPS.get(i + 1) : "DONE";
            try { executor.execute(step, next); }
            catch (RuntimeException failure) { return new Result(step, failure); }
        }
        return new Result("DONE", null);
    }
}
