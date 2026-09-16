using BecomeAWizzard.Api.DTOs;

namespace BecomeAWizzard.Api.Validation;

// TASK 5 STARTER
// DTO DataAnnotations cover basic shape validation. These methods should cover cross-field/domain rules.
public static class ValidationRules
{
    public static IReadOnlyDictionary<string, string[]> ValidateQuiz(QuizInput input)
    {
        // TODO 5.7: return field-oriented errors for HP, question count, correct answers and optional boss settings.
        return new Dictionary<string, string[]>();
    }
}
