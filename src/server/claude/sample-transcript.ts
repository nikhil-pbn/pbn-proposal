/**
 * A realistic sales call transcript, used by `npm run claude:try` to exercise
 * the pipeline end to end without waiting for a real call recording.
 */
export const SAMPLE_TRANSCRIPT = `Kelly Geisser: Thanks for making time, Noah. Before we dig in — you're the office manager at New Horizons Dental, right?

Noah Stella: That's right. Two doctors, six chairs, twelve of us including hygiene. Single location in Beaverton.

Kelly: And you're on Dentrix?

Noah: Dentrix, yeah. Going on nine years. I'll say up front — we're not switching. Last time we talked about migrating, the quote was insane and the downtime would've killed us.

Kelly: Understood, and you don't have to. PbN sits on top of Dentrix. Let's talk about what's actually costing you time instead. What does a bad day look like?

Noah: Phones. Honestly it's the phones. Every single appointment goes through the front desk. Someone calls, we look at the schedule, we book it. If both my people are already on a call, it rings out. And we close at five, so anyone who thinks about their teeth in the evening either calls tomorrow or doesn't.

Kelly: Do you have any sense of how many you're losing?

Noah: Not really, that's part of the problem. We don't have call reporting. I know we get voicemails overnight and I know not all of them convert, but I couldn't give you a number.

Kelly: What about no-shows?

Noah: That one I can feel. We do reminders manually — one of the girls goes through tomorrow's schedule and calls or texts from her own phone if she's got time. If it's a busy afternoon it just doesn't happen. And then we've got two or three empty chairs the next morning and no time to fill them.

Kelly: So the reminder happens when someone has a spare twenty minutes.

Noah: Right. And it's her personal cell, which I've never loved. If she's off, that whole thread is gone.

Kelly: Let's talk numbers for a second. How do you know how the practice is doing?

Noah: Dr. Patel asks me for production and collections at the end of the month. I pull three reports out of Dentrix, put them in a spreadsheet, and reconcile against the bank. Takes me the better part of a day. By the time he sees it, the month's over and there's nothing to do about it.

Kelly: What about treatment that was diagnosed but never scheduled?

Noah: I know it's in there somewhere. I don't have a good way to get at it. We probably leave real money on the table there, I just can't prove it.

Kelly: Last one — new patient paperwork.

Noah: Clipboard. They fill it out in the waiting room, then someone keys it into Dentrix. Takes fifteen minutes a patient and we get maybe forty-five new patients a month. And people's handwriting is genuinely terrible, so we get insurance details wrong and the claim bounces.

Kelly: Do you know your denial rate?

Noah: High enough that I notice it. Again, no number.

Kelly: Okay. That's four things, and they're all things we do. Online booking so patients schedule themselves against your real availability, at eleven at night if they want. Automated reminder sequences so it isn't anybody's job. Digital forms that sync straight into Dentrix, so nothing gets re-typed. And real-time analytics so Dr. Patel sees production as it happens instead of three weeks late — including outstanding treatment.

Noah: How long does that take to set up? I can't have the practice down.

Kelly: Nothing goes down. Roughly four weeks: we connect to Dentrix in week one, build your reminder sequences and forms in weeks two and three, train the team in week four. Training is by role, so your hygienists only learn their part.

Noah: What's it cost?

Kelly: It's modular — you pay for what you use. Analyze, our analytics tier, starts at $249 a month. For what you're describing you'd want the patient communication piece too, so I'd want to put an exact number in front of you rather than guess on this call. Let me get you a proposal with the scope we just discussed.

Noah: That works. Send it over and I'll take it to Dr. Patel — he's the one who signs. He's going to ask about the Dentrix thing first, so make that clear.

Kelly: I'll put it at the top. I'll also include the implementation timeline so he can see there's no downtime. Anything else he'll push on?

Noah: Contract length. He hates getting locked in.

Kelly: I'll cover that too — monthly and annual are both options. I'll have this to you today.

Noah: Great, thanks Kelly.`;
