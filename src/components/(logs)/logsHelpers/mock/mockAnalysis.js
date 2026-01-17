const mockAnalysis = {
  execution_timeline: [
    {
      step_number: 1,
      action_taken: "LLM call for agent reasoning (initial prompt processing and intent understanding).",
      reasoning_given: "The agent is processing the user's request to send an email and attempting to gather necessary information. It initially asks for subject and content but is then instructed by the user to make them up. It then drafts an email and asks for confirmation.",
      was_necessary: true,
    },
    {
      step_number: 2,
      action_taken: "LLM call to generate email body content based on extracted instructions and tone.",
      reasoning_given: "The agent generated an email body based on the 'instructions' and 'tone' extracted in the previous step.",
      was_necessary: true,
    },
    {
      step_number: 3,
      action_taken: "LLM call for agent reasoning (processing user confirmation and preparing to send email).",
      reasoning_given: "The agent processed the user's confirmation ('Yes') and the previously drafted email content. It then concludes the email is ready to be sent and confirms its success.",
      was_necessary: true,
    },
    {
      step_number: 4,
      action_taken: "Email tool call to send the drafted email.",
      reasoning_given: "The agent executed the 'send_email' tool with the recipient, subject, and body that were previously composed and confirmed.",
      was_necessary: true,
    },
  ],
  context_tracking: {
    per_step_context_usage: [
      {
        step_number: 1,
        step_name: "agent_reasoning",
        context_available: {
          description: "The initial user prompt asking to send an email and subsequent conversation turns, including the user's instruction not to ask questions and to make up details.",
          key_fields: [
            "user_task: Send an email to srimans572@gmail.com. No questions, just send the email without asking me any further.",
            "conversation_history: User's instructions to make up details, confirmation 'Sure'.",
          ],
        },
        context_used: {
          description: "The agent used the conversation history to understand the user's intent, the recipient's email address, and the instruction to create content.",
          key_fields: [
            "to: srimans572@gmail.com",
            "subject: Made up subject (from agent's creation)",
            "instructions: Just wanted to say hi and see how they're doing. Hope they're well! (from agent's creation)",
            "tone: casual (from agent's creation)",
          ],
        },
        context_ignored: {
          description: "No critical context appears to have been ignored in this step.",
          key_fields: [],
          impact: "none",
        },
        should_have_checked: null,
      },
      {
        step_number: 2,
        step_name: "generate_email",
        context_available: {
          description: "The 'instructions' and 'tone' extracted by the previous agent_reasoning step.",
          key_fields: [
            "instructions: Just wanted to say hi and see how they're doing. Hope they're well!",
            "tone: casual",
          ],
        },
        context_used: {
          description: "The agent used the provided instructions and tone to generate the email body.",
          key_fields: [
            "body: Hey!\\n\\nJust wanted to say hi and see how you're doing. Hope you're well!\\n\\nLater,\\n[Your Name]\\n",
          ],
        },
        context_ignored: {
          description: "No critical context appears to have been ignored in this step.",
          key_fields: [],
          impact: "none",
        },
        should_have_checked: null,
      },
      {
        step_number: 3,
        step_name: "agent_reasoning",
        context_available: {
          description: "The conversation history, including the user's confirmation 'Yes', the previously drafted email content, and the fact that an email was previously sent.",
          key_fields: [
            "conversation_history: User said 'Yes' to sending the drafted email.",
            "pendingEmail: Contains drafted email details.",
            "emailJustSent: false (indicating it was drafted but not yet sent in this interaction)",
          ],
        },
        context_used: {
          description: "The agent correctly interpreted the 'Yes' as confirmation to send the drafted email.",
          key_fields: [
            "action: done",
            "reasoning: The user said 'Yes' which in the context of the previous turn means they want to send the email that was drafted.",
          ],
        },
        context_ignored: {
          description: "The agent seemed to correctly process the confirmation. It did not ignore any critical context.",
          key_fields: [],
          impact: "none",
        },
        should_have_checked: null,
      },
      {
        step_number: 4,
        step_name: "send_email",
        context_available: {
          description: "The parameters required for sending an email: recipient, subject, and body, which were prepared in previous steps.",
          key_fields: [
            "to: srimans572@gmail.com",
            "subject: Made up subject",
            "body: Hey!\\n\\nJust wanted to say hi and see how you're doing. Hope you're well!\\n\\nLater,\\n[Your Name]\\n",
          ],
        },
        context_used: {
          description: "The agent successfully used the provided parameters to send the email via the gmail tool.",
          key_fields: [
            "success: true",
            "message: Email sent successfully",
          ],
        },
        context_ignored: {
          description: "No critical context appears to have been ignored in this step.",
          key_fields: [],
          impact: "none",
        },
        should_have_checked: null,
      },
    ],
    context_blindness_detected: false,
    context_blindness_count: 0,
    worst_context_miss: null,
  },
  reasoning_forensics: {
    decision_graph: [
      {
        step_number: 1,
        decision_point: "Decide how to proceed with email composition given user's conflicting instructions (send now vs. make up details).",
        reasoning_provided: "The agent initially asked for details, was told to make them up, and then proceeded to make them up and draft an email for user review.",
        reasoning_quality: "sound",
        reasoning_gaps: [],
        alternative_decisions: [],
      },
      {
        step_number: 2,
        decision_point: "Generate email body content.",
        reasoning_provided: "Based on extracted instructions ('Just wanted to say hi and see how they're doing. Hope they're well!') and tone ('casual').",
        reasoning_quality: "sound",
        reasoning_gaps: [],
        alternative_decisions: [],
      },
      {
        step_number: 3,
        decision_point: "Confirm email sending after user says 'Yes'.",
        reasoning_provided: "User confirmation 'Yes' in the context of a drafted email means they want to send it.",
        reasoning_quality: "sound",
        reasoning_gaps: [],
        alternative_decisions: [],
      },
      {
        step_number: 4,
        decision_point: "Execute the send_email tool.",
        reasoning_provided: "The previous step confirmed the email should be sent, and all necessary parameters are available.",
        reasoning_quality: "sound",
        reasoning_gaps: [],
        alternative_decisions: [],
      },
    ],
  },
  goal_evaluation: {
    user_task: "Send an email to srimans572@gmail.com. No questions, just send the email without asking me any further.",
    goal_completed: true,
    completion_quality: "perfect",
    requirements_analysis: [
      {
        requirement: "Send an email to srimans572@gmail.com",
        satisfied: true,
        evidence: "The 'send_email' step used 'srimans572@gmail.com' as the recipient.",
        step_that_satisfied: 4,
      },
      {
        requirement: "No questions, just send the email",
        satisfied: true,
        evidence: "The agent initially asked clarifying questions but was instructed by the user to not ask further. It then proceeded to make up content and send without further user interaction after the confirmation.",
        step_that_satisfied: 4,
      },
      {
        requirement: "without asking me any further",
        satisfied: true,
        evidence: "After the user's explicit instruction, the agent only proceeded to draft and send, only asking for confirmation after drafting, which is standard procedure, and not 'asking further' in the sense of requesting new information.",
        step_that_satisfied: 4,
      },
    ],
    output_correctness: {
      final_output: "✅ Email sent successfully to srimans572@gmail.com! Is there anything else I can help you with?",
      expected_output: "The email should be sent successfully, and the agent should confirm it.",
      matches_goal: true,
      discrepancies: [],
      quality_issues: [],
    },
    goal_drift_detected: false,
    goal_drift_points: [],
  },
  summary: {
    overall_health_score: 100,
    one_line_verdict: "Email successfully sent with made-up content as per user's explicit instructions.",
    what_went_right: [
      "Agent correctly interpreted and followed the user's contradictory instructions (send immediately vs. make up details).",
      "Agent successfully drafted and sent the email with the specified recipient.",
      "Agent maintained context throughout the conversation, referencing previous turns correctly.",
    ],
    what_went_wrong: [],
    root_cause_summary: "N/A - The agent executed the task successfully by correctly interpreting and acting upon the user's explicit instructions, including the directive to create content.",
    tags: ["email", "instruction following", "content generation", "user override"],
  },
};

export default mockAnalysis;
