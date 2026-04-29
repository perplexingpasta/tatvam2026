I have finally gotten the real events list for this upcoming college fest. It's:



"music events





swar leela: solo eastern singing (classical & non-classical) - 75



solo western singing - 75



jugalbandi: duet vocals - 150 (for team of 2)



ahaang: battle of bands - 1199 (for team)



tarang: instrumental solo (online event) - free

dance events





natyanjali: solo classical dance - 75



solo non-classical dance - 75



face off - 75



reflections - 75/person(min 2, max 10)



group dance - 799 total (min 6, max 16)

assorted events





sapientia - 150 (for team of 2)



escape room - 99/person (min 2, max 6)



fashion a. main event - 1299 total (min 12, max 20) b. twin vogue - 199 (for team of 2)



gaming





fifa (pc) - 150



bgmi (mobile) - 399 (for team of 4 plus 1 substitute)



CODM (mobile) - 499 (for team of 5 plus 1 substitute)

quiz events





general quiz - 75/person (min 1, max 3)



mela quiz - 75/person (min 1, max 2)

drama events





streetplay - 799 total (min 8, max 12)



mono act - 75



dramathon - 199 total (min 2, max 4)



mad ads (online) - 150 total (min 3, max 5)

art events





art attack - 299 total (min 3, max 6)



tote bag painting - 150 (team of 2)



face painting - 99



relay painting - 299 total (team of 4)



duotone - 75

literary events





shipwreck - 75



jam - 75



debate - 150 (for team of 2)



lit marathon - 299 (team of 4)



poetry (online) - free"





As you can see, each event field will have an unique eventID, indian name, an english name, a short description, price (either per person or in total), team members specification, minimumTeamSize and maximumTeamSize, event schedule (time and date), event image, venue, type of event (solo/group) and tags (solo/group, >4 members, <₹300 price, etc.) Each event should have all these fields even though they might be blank for now, I'll fill it in later. On the /events page, since it's a card based layout, users will only see both the event names, their tags, dates, time and venue. When they click on any event, a new page opens up (/events/event-name) and there they see the entire description and imahges (if any). From there they can add the event to the cart


Also, currently on /events we are categorising events by either solo or group, change that to these categories as above (drama, art, literary, music events, etc.).
The events should appear in card based formats and stack vertically on mobile device. Also, add a small collapse button beside the category names. So, if the user clicks on the collapse button near the music events section, the entire section collapses and the user can view the next section such as dance events.


Also on the same /events page, there should be a robust search functionality which lets user search in for the event by either its uniqueID or indian or english name. Just below the search bar should be tags so that the users can immediately filter out results based on specific tags (all the events will have the relevant tag attribute). These tags could be something like solo, group, >4 members, <₹300 price, etc.


I want something quite similar to this but with added functionality: https://vagus-sammscrithi-2026.vercel.app/sammscrithi