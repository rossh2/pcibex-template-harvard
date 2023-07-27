PennController.ResetPrefix()

// Make sure you enable URL parameters on Prolific so that the Prolific ID is passed and recorded
Header()
.log("PROLIFIC_ID", GetURLParameter("PROLIFIC_PID"))

Sequence(
    "consent", 
    "instructions", 
    "training",
    "post-training-instructions",
    randomize("target-items"), 
    "follow-up", 
    "comments", 
    "send", 
    "completion-screen"
)

newTrial("consent",
    newHtml("consent-html", "irb-consent.html")
        .print(),
    newButton("consent-next-button", "I consent to taking part in this survey &rarr;")
        .right()
        .print()
        .wait()
)

newTrial("instructions",
    newHtml("instructions-html", "instructions.html")
        .print(),
    newButton("instructions-next", "Next &rarr;")
        .right()
        .print()
        .wait()
)

function makeTrial(trial_label, row) {
    /** This function contains some slightly fancy logic so that it can be used for both your training
     * examples and your actual experiment items, while ensuring that the same question and scale
     * is used for both (so they don't get out of sync if you decide to change them!)
     * 
     * Ultimately, all that's happening here is that we're making a list of items that are going to
     * get passed to newTrial, as if you were just passing them directly separated by commas.
     * 
     * If you want to add more items, just copy a trial_elements.push(...) section and put it in the
     * right place in the order of elements.
     */
    trial_elements = []
    trial_elements.push(
        newText("question", "<p>How natural is the following sentence?</p>")
            .center()
            .print()
    )
    trial_elements.push(
        newText("target-sentence", "<p><strong>" + row.sentence + "</strong></p>")
            .center()
            .print()
    )
    if ("instructions" in row) {
        // This is a training trial; add instructions before the scale
        trial_elements.push(
            newText("training-instructions", "<p><em>" + row.instructions + "</em></p>")
            .center()
            .print()
        )
    }
    trial_elements.push(
        newScale("likert-scale", "Very unnatural", "Somewhat unnatural", "Unsure", "Somewhat natural", "Very natural")
            .log()
            .button()
            .center()
            .print()
            .wait()
    )
    trial_elements.push(
        newButton("next-button", "Next &rarr;")
            .right()
            .print()
            .wait()
    )
    
    return newTrial(trial_label, ...trial_elements)
}

Template("TrainingItems.csv", row =>
    makeTrial("training", row)
    .log("item", row.item)
    .log("condition", row.condition)
)

newTrial("post-training-instructions",
    newHtml("post-instructions-html", "post-training-instructions.html")
        .print(),
    newButton("post-instructions-next", "Next &rarr;")
        .right()
        .print()
        .wait()
)

Template("SampleItems.csv", row => 
    makeTrial("target-items", row)
    .log("group", row.group)
    .log("item", row.item)
    .log("condition", row.condition)
)

newTrial("follow-up",
    newText("follow-up-title", "<h2>Follow-up</h2>")
        .print(),
    newText("follow-up-blurb", "<p>In order to complete this questionnaire, please answer the following questions. The answers to these questions are to help us better understand your linguistic judgments and will not affect your payment.</p>")
        .print(),
    newText("native-speaker-question", "<p>Some judgments can depend on when you first learned a language. Did you learn English before the age of 5?</p>")
        .print(),
    newScale("native-speaker", "Yes", "No")
        .log()
        .button()
        .print()
        .wait(),
    newText("dialect-question", "<p>Some judgments can depend on your dialect of English. Would you describe yourself as speaking American English (as opposed to British, Australian, ... English)?</p>")
        .print(),
    newTextInput("other-dialect")
        .log()
        .lines(1), // Use CSS to change the width of this
    newScale("dialect", "Yes, I speak American English", "No, I speak: ")
        .log()
        .button() /* labelsPosition("right") */
        .after(getTextInput("other-dialect")) // Put the text input after this element
        .print()
        .wait(),
    // TODO: wait until either yes is clicked or the other-dialect box is filled (question: how to do boolean wait conditions?)
    newText("other-languages-question", "<p>Judgments for one language may also depend on knowledge of another language. Do you consider yourself to be as strong or stronger in any other languages as you are in English? If so, please list them below.</p>")
        .print(),
    newTextInput("other-languages")
        .log()
        .lines(1) // Use CSS to change the width of this
        .print(),
    newButton("follow-up-next", "Next &rarr;")
        .right()
        .print()
        .wait()
)

newTrial("comments",
    newText("comments-question", "<p>Any comments about this survey?</p>")
        .print(),
    newTextInput("comments")
        .log()
        .lines(0)
        .size(400, 100)
        .print(),
    newButton("comments-next", "Next &rarr;")
        .right()
        .print()
        .wait()
)

SendResults("send")

newTrial("completion-screen",
    newText("thanks", "<p>Thank you for participating!</p>")
        .center()
        .print(),
    // Replace this dummy URL with the Prolific completion URL for your study
    newText("<p><a class=\"redirect button\" href=\"https://app.prolific.co/submissions/complete?cc=CODEGOESHERE\">Click here to return to Prolific and receive participation credit.</a></p>")
        .center()
        .print(),
    newButton("void", "")
        .wait() // Never print this button, so the experiment stays on this page indefinitely until they click the link
)
