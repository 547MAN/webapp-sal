using BecomeAWizzard.Api.DTOs;
using BecomeAWizzard.Api.Extensions;
using BecomeAWizzard.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BecomeAWizzard.Api.Controllers;

// Task 4 game rules are supplied. Task 5 must map missing, invalid and conflicting game operations.
[Authorize, ApiController, Route("api/game")]
public class GameController(GameService gameService) : ControllerBase
{
    [HttpPost("attempts")]
    public async Task<ActionResult> Start(StartAttemptRequest request) => Ok(await gameService.StartAsync(User.GetUserId(), request.QuizId));

    [HttpGet("attempts/{id:int}")]
    public async Task<ActionResult> State(int id) => await gameService.GetStateAsync(id, User.GetUserId()) is { } state ? Ok(state) : NotFound();

    [HttpPost("attempts/{id:int}/answers")]
    public async Task<ActionResult> Answer(int id, SubmitAnswerRequest request) =>
        Ok(await gameService.SubmitAnswerAsync(id, User.GetUserId(), request));
}
