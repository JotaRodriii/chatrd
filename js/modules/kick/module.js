/* ---------------------- */
/* KICK MODULE VARIABLES */
/* ---------------------- */

const showKick                      = getURLParam("showKick", false);

const kickUserName                  = getURLParam("kickUserName", "");

const showKickMessages              = getURLParam("showKickMessages", true);
const showKickFollows               = getURLParam("showKickFollows", true);
const showKickKicks                 = getURLParam("showKickKicks", true);
const showSmallKicksGifts           = getURLParam("showSmallKicksGifts", false);
const showKickSubs                  = getURLParam("showKickSubs", true);
const showKickGiftedSubs            = getURLParam("showKickGiftedSubs", true);
const showKickMassGiftedSubs        = getURLParam("showKickMassGiftedSubs", true);
const showKickGiftedSubsUserTrain   = getURLParam("showKickGiftedSubsUserTrain", true);
const showKickRewardRedemptions     = getURLParam("showKickRewardRedemptions", true);
const showKickRaids                 = getURLParam("showKickRaids", true);
const showKickViewers               = getURLParam("showKickViewers", true);

const kickAvatars = new Map();
const kick7TVEmojis = new Map();
const kickSubBadges = [];

const kickWebSocketURL = 'wss://ws-us2.pusher.com/app/32cbd69e4b950bf97679?protocol=7&client=js&version=8.4.0&flash=false';

const kicksGiftsClasses = [
    { min: 1,  max: 9, class: 'normal-gift' },
    { min: 10,  max: 49, class: 'bigger-than-10' },
    { min: 50,  max: 99, class: 'bigger-than-50' },
    { min: 100,  max: 499, class: 'bigger-than-100' },
    { min: 500,  max: 999, class: 'bigger-than-500' },
    { min: 1000,  max: 4999, class: 'bigger-than-1000' },
    { min: 5000,  max: 9999, class: 'bigger-than-5000' },
    { min: 10000,  max: 49999, class: 'bigger-than-10000' },
    { min: 50000,  max: 99999, class: 'bigger-than-50000' },
    { min: 100000,  max: 99999999999, class: 'bigger-than-100000' },
];


// KICK EVENTS HANDLERS

const kickMessageHandlers = {

    /*'Kick.ChatMessage': (response) => {\
        kickChatMessage(response.data);
    },*/
    'Kick.Follow': (response) => {
        kickFollowMessage(response.data);
    },

};



document.addEventListener('DOMContentLoaded', () => {
    if (showKick) {

        const kickStatistics = `
            <div class="platform" id="kick" style="display: none;">
                <img src="js/modules/kick/images/logo-kick.svg" alt="">
                <span class="viewers"><i class="fa-solid fa-user"></i> <span>0</span></span>
            </div>
        `;

        document.querySelector('#statistics').insertAdjacentHTML('beforeend', kickStatistics);

        if (showKickViewers == true) { document.querySelector('#statistics #kick').style.display = ''; }

        console.debug('[Kick][Debug] DOMContentLoaded fired');

        registerPlatformHandlersToStreamerBot(kickMessageHandlers, '[Kick][SB1]');
        
        kickConnection();
    }
    
});






// -----------------------
// KICK CONNECT HANDLER

async function kickConnection() {
    if (!kickUserName) return;

    const kickMaxTries = 20;
    const kickReconnectDelay = 10000;
    let retryCount = 0;
    


    async function connect() {
        try {
            const kickUserInfo = await kickGetUserInfo(kickUserName);
            const kickUserId = kickUserInfo.user_id;

            if (!kickUserInfo || !kickUserInfo.chatroom || !kickUserInfo.chatroom.id) {
                throw new Error('Chatroom ID not found');
            }

            console.debug(`[Kick] User info for ${kickUserName}!`, kickUserInfo);

            const kickChatRoomId = kickUserInfo.chatroom.id;
            const kickChannelId = kickUserInfo.chatroom.channel_id;

            if (!kickChatRoomId) {
                console.error(`[Kick] Could not find chatroom id for ${kickUserName}!`);
                return;
            }
            
            console.debug(`[Kick] Chatroom for ${kickUserName} Found! (ID: ${kickChatRoomId})`);
            
            kickSubBadges.push(...kickUserInfo.subscriber_badges);

            const kickWebSocket = new WebSocket(kickWebSocketURL);

            kickWebSocket.onopen = () => {
                kickConnectionState = true;
                retryCount = 0;

                console.debug(`[Kick] Connected to Kick!`);
                notifySuccess({
                    title: 'Connected to Kick',
                    text: `User set to <strong>${kickUserName}</strong>.`
                });


                
                // Getting 7TV User Emotes and Global Emotes
                (async () => {
                    const kick7TVEmotes = await getKick7TVEmotes(kickUserId);
                    if (kick7TVEmotes != null) {
                        kick7TVEmotes.forEach(emote => {
                            kick7TVEmojis.set(emote.name, emote.url);
                        });
                    }
                })();




                if (showKickViewers === true) {
                    setInterval(() => {
                        kickGetUserInfo(kickUserName).then(data => {
                            kickUpdateStatistics(data);
                        });
                    }, 15000);
                }
            };

            kickWebSocket.onmessage = (response) => {
                const data = JSON.parse(response.data);
                const kickData = JSON.parse(data.data);
                const kickEvent = data.event.split('\\').pop();

                console.debug(`[Kick] ${kickEvent}`, kickData);

                if (data.event === 'pusher:connection_established') {
                    
                    console.debug(`[Kick][Pusher] Connection established! (ID:${kickData.socket_id})`);

                    const channels = [
                        `chatroom_${kickChatRoomId}`,
                        `chatrooms.${kickChatRoomId}`,
                        `chatrooms.${kickChatRoomId}.v2`,
                        `predictions-channel-${kickChatRoomId}`,
                        `channel_${kickChannelId}`
                    ];

                    channels.forEach(channel => {
                        kickWebSocket.send(JSON.stringify({
                            event: 'pusher:subscribe',
                            data: { channel }
                        }));
                    });
                }

                if (data.event === "pusher:ping") {
                    kickWebSocket.send(JSON.stringify({
                        event: "pusher:pong",
                        data: {}
                    }));
                }

                switch (kickEvent) {
                    case 'ChatMessageEvent': kickChatMessage(kickData); break;
                    case 'SubscriptionEvent': kickSubMessage(kickData); break;
                    case 'GiftedSubscriptionsEvent': kickGiftMessage(kickData); break;
                    case 'RewardRedeemedEvent': kickRewardRedemption(kickData); break;
                    case 'StreamHostEvent': kickRaidMessage(kickData); break;
                    case 'MessageDeletedEvent': kickChatMessageDeleted(kickData); break;
                    case 'UserBannedEvent': kickUserBanned(kickData); break;
                    case 'ChatroomClearEvent': kickChatClearMessages(); break;
                    case 'KicksGifted': kickKicksGiftedMessage(kickData); break;
                }
            };

            kickWebSocket.onclose = (event) => {
                setTimeout(connect, kickReconnectDelay);

                /*console.warn(`[Kick] WebSocket closed (code: ${event.code})`);

                if (retryCount < kickMaxTries) {
                    retryCount++;
                    notifyError({
                        title: 'Kick Disconnected',
                        text: `Retrying in ${kickReconnectDelay / 1000}s (${retryCount}/${kickMaxTries})`
                    });
                    setTimeout(connect, kickReconnectDelay);
                } else {
                    notifyError({
                        title: 'Kick Reconnect Failed',
                        text: `Maximum retries (${kickMaxTries}) reached.`
                    });
                }*/
            };

            kickWebSocket.onerror = (error) => {
                console.error('[Kick] WebSocket error:', error);
                kickWebSocket.close();
            };

        }
        catch (error) {
            setTimeout(connect, kickReconnectDelay);
            
            /*console.error(`[Kick] Failed to connect: ${error.message}`);

            if (retryCount < kickMaxTries) {
                retryCount++;
                notifyError({
                    title: 'Kick Connection Error',
                    text: `Retrying in ${kickReconnectDelay / 1000}s (${retryCount}/${kickMaxTries})`
                });
                setTimeout(connect, kickReconnectDelay);
            } else {
                notifyError({
                    title: 'Kick Reconnect Failed',
                    text: `Maximum retries (${kickMaxTries}) reached.`
                });
            }*/
        }
    }

    return await connect();
}





// ---------------------------
// KICK UTILITY FUNCTIONS

async function kickChatMessage(data) {
    
    if (showKickMessages == false) return;
    if (ignoreUserList.includes(data.sender.username.toLowerCase())) return;
    if (data.content.startsWith("!") && excludeCommands == true)  return;

	const template = chatTemplate;
	const clone = template.content.cloneNode(true);
    const messageId = data.id;
    const userId = data.sender.id;
    const userSlug = data.sender.slug;

    const {
        'first-message': firstMessage,
        'shared-chat': sharedChat,
        
        header,
        timestamp,
        platform,
        badges,
        avatar,
        pronouns: pronoun,
        user,
        
        reply,
        'actual-message': message
    } = Object.fromEntries(
        [...clone.querySelectorAll('[class]')]
            .map(el => [el.className, el])
    );

    const classes = ['kick', 'chat'];

    if (userSlug == kickUserName) classes.push('streamer');

    const [avatarImage, messageHTML, badgesHTML] = await Promise.all([
        getKickAvatar(data.sender.slug),
        getKickEmotes(data.content),
        getKickBadges(data.sender.identity.badges),
    ]);

    header.remove();
    firstMessage.remove();

    user.style.color = data.sender.identity.color;
    user.textContent = data.sender.username;
    message.innerHTML = messageHTML;

    if (showAvatar) avatar.innerHTML = `<img src="${avatarImage}">`; else avatar.remove();
    if (showBadges) {
        if (!badgesHTML) { badges.remove(); }
        else { badges.innerHTML = badgesHTML; }
     }
    else { badges.remove(); }

    if (data.type == "reply") {
        classes.push('reply');
        var replyHTML = await getKickEmotes(data.metadata.original_message.content);
        reply.insertAdjacentHTML('beforeend', `Replying to <strong>${data.metadata.original_sender.username}:</strong> ${replyHTML}`);
    }
    else { reply.remove(); }

    sharedChat.remove();
    pronoun.remove();

    addMessageItem('kick', clone, classes, userSlug, messageId);
}



async function kickFollowMessage(data) {

    if (showKickFollows == false) return;

    const template = eventTemplate;
	const clone = template.content.cloneNode(true);
    const messageId = createRandomString(40);
    const userId = data.user.login.toLowerCase();
    //const userId = data.userName.toLowerCase();

    const {
        header,
        platform,
        user,
        action,
        value,
        'actual-message': message
    } = Object.fromEntries(
        [...clone.querySelectorAll('[class]')]
            .map(el => [el.className, el])
    );

    const classes = ['kick', 'follow'];

    header.remove();
    
    user.textContent = data.user.name;
    //user.innerHTML = `<strong>${data.userName}</strong>`;

    action.innerHTML = ` followed you`;
    
    value.remove()

    message.remove();

    addEventItem('kick', clone, classes, userId, messageId);
}



async function kickKicksGiftedMessage(data) {

    if (showKickKicks == false) return;

    const template = eventTemplate;
	const clone = template.content.cloneNode(true);
    const messageId = createRandomString(40);
    const userId = data.sender.username.toLowerCase();

    const {
        header,
        platform,
        user,
        action,
        value,
        'actual-message': message
    } = Object.fromEntries(
        [...clone.querySelectorAll('[class]')]
            .map(el => [el.className, el])
    );

    const classes = ['kick', 'kicksgifted'];

    if (showSmallKicksGifts == true) { classes.push('small-gift'); }

    header.remove();

    var kicksGiftId = data.gift.gift_id.replace('_', '-');
    var kicksGiftImage = `<img class="gift-image" src="https://files.kick.com/kicks/gifts/${kicksGiftId}.webp" alt="${data.gift.name}">`;
    
    user.textContent = data.sender.username;
    action.innerHTML = ` sent a <strong>${data.gift.name}</strong> `;

    const kicksMatch = kicksGiftsClasses.find(lv => data.gift.amount >= lv.min && data.gift.amount <= lv.max);
    classes.push(kicksMatch.class);

    var kicksGift = data.gift.amount > 1 ? 'Kicks' : 'Kick';
    value.innerHTML = `
        <div class="gift-info">
            <span class="gift-image">${kicksGiftImage}</span>
            <span class="gift-value"><img src="js/modules/kick/images/icon-kicksgift.svg" alt="${kicksGift}"> ${data.gift.amount}</span>
        </div>
    `;

    if (!data.message) { message.remove(); }
    else {
        var kicksMessage = await getKickEmotes(data.message);
        message.innerHTML = kicksMessage;
    }

    addEventItem('kick', clone, classes, userId, messageId);
}




async function kickSubMessage(data) {

    if (showKickSubs == false) return;

    const template = eventTemplate;
	const clone = template.content.cloneNode(true);
    const messageId = createRandomString(40);
    const userId = data.username.toLowerCase();

    const {
        header,
        platform,
        user,
        action,
        value,
        'actual-message': message
    } = Object.fromEntries(
        [...clone.querySelectorAll('[class]')]
            .map(el => [el.className, el])
    );

    const classes = ['kick', 'sub'];

    header.remove();

    user.textContent = data.username;

    action.innerHTML = ` subscribed for `;

    //var months = data.months > 1 ? 'months' : 'month';
    var months = formatSubMonthDuration(data.months);
    
    value.innerHTML = `<strong>${months}</strong>`;

    message.remove();

    addEventItem('kick', clone, classes, userId, messageId);
}



async function kickGiftMessage(data) {

    if (showKickGiftedSubs == false) return;

    const template = eventTemplate;
	const clone = template.content.cloneNode(true);
    const messageId = createRandomString(40);
    const userId = data.gifter_username.toLowerCase();

    const {
        header,
        platform,
        user,
        action,
        value,
        'actual-message': message
    } = Object.fromEntries(
        [...clone.querySelectorAll('[class]')]
            .map(el => [el.className, el])
    );

    const classes = ['kick', 'gift'];

    header.remove();

    
    user.textContent = data.gifter_username;

    var giftedLength = data.gifted_usernames.length;
    
    if (giftedLength > 1 && showKickMassGiftedSubs == true) {
        action.innerHTML = ` gifted <strong>${giftedLength} subs</strong> to the Community`;
        message.innerHTML = `They've gifted a total of <strong>${data.gifter_total} subs</strong>`;
        value.remove();

        if (showKickGiftedSubsUserTrain == true) {    
            for (recipients of data.gifted_usernames) {
                kickGiftSingleSub(data.gifter_username, recipients);
            }   
        }
        
        addEventItem('kick', clone, classes, userId, messageId);
    }
    else {
        kickGiftSingleSub(data.gifter_username, data.gifted_usernames[0]);
    }
    
}



async function kickGiftSingleSub(gifter, recipient) {
    const template = eventTemplate;
	const clone = template.content.cloneNode(true);
    const messageId = createRandomString(40);
    const userId = gifter.toLowerCase();

    const {
        header,
        platform,
        user,
        action,
        value,
        'actual-message': message
    } = Object.fromEntries(
        [...clone.querySelectorAll('[class]')]
            .map(el => [el.className, el])
    );

    const classes = ['kick', 'gift'];

    header.remove();
    message.remove();

    user.textContent = gifter;

    action.innerHTML = ` gifted a subscription to `;
    
    value.innerHTML = `<strong>${escapeHTML(recipient)}</strong>`;

    addEventItem('kick', clone, classes, userId, messageId);
}



async function kickRewardRedemption(data) {

    if (showKickRewardRedemptions == false) return;

    const template = eventTemplate;
	const clone = template.content.cloneNode(true);
    const messageId = createRandomString(40);
    const userId = data.username.toLowerCase();

    const {
        header,
        platform,
        user,
        action,
        value,
        'actual-message': message
    } = Object.fromEntries(
        [...clone.querySelectorAll('[class]')]
            .map(el => [el.className, el])
    );

    const classes = ['kick', 'reward'];

    header.remove();

    user.textContent = data.username;
    action.innerHTML = ` redeemed `;
    value.innerHTML = `<strong>${data.reward_title}</strong>`;
    
    var userInput = data.user_input ? `${data.user_input}` : '';
    message.innerHTML = `${userInput}`;

    addEventItem('kick', clone, classes, userId, messageId);
}




async function kickRaidMessage(data) {

    if (showKickRaids == false) return;

    const template = eventTemplate;
	const clone = template.content.cloneNode(true);
    const messageId = createRandomString(40);
    const userId = data.host_username.toLowerCase();

    const {
        header,
        platform,
        user,
        action,
        value,
        'actual-message': message
    } = Object.fromEntries(
        [...clone.querySelectorAll('[class]')]
            .map(el => [el.className, el])
    );

    const classes = ['kick', 'raid'];

    header.remove();
    message.remove();

    user.textContent = data.host_username;

    var viewers = data.number_viewers > 1 ? 'viewers' : 'viewer';
    action.innerHTML = ` hosted the channel with `;
    value.innerHTML = `<strong>${data.number_viewers} ${viewers}</strong>`;

    addEventItem('kick', clone, classes, userId, messageId);
}





async function kickChatMessageDeleted(data) {
    document.getElementById(data.message.id)?.remove();
}



async function kickUserBanned(data) {
    chatContainer.querySelectorAll(`[data-user="${data.user.slug}"]`).forEach(element => {
        element.remove();
    });
}



async function kickChatClearMessages() {
    chatContainer.querySelectorAll(`.item.kick`).forEach(element => {
        element.remove();
    });
}



async function kickUpdateStatistics(data) {
    if (showPlatformStatistics == false || showKickViewers == false) return;
    if (data.livestream == null) { }
    else {
        const viewers = formatNumber(DOMPurify.sanitize(data.livestream.viewer_count)) || "0";
        document.querySelector('#statistics #kick .viewers span').textContent = viewers;
    }
}



async function kickGetUserInfo(user) {
    const response = await fetch( `https://kick.com/api/v2/channels/${user}` );
    
    if (response.status === 404) {
        console.error("[Kick] User was not found!");
        return 404;
    }
    else {
        const data = await response.json();
        return data;
    }
}

async function getKickAvatar(user) {
    if (!showAvatar) return;

    const DEFAULT_AVATAR = 'https://kick.com/img/default-profile-pictures/default2.jpeg';

    if (kickAvatars.has(user)) {
        console.debug(`[Kick] Kick avatar found for ${user}!`);
        return kickAvatars.get(user);
    }

    console.debug(`[Kick] Kick avatar not found for ${user}! Trying to get it...`);

    try {
        const response = await kickGetUserInfo(user);
        const rawPic = response?.user?.profile_pic;

        const avatarUrl = (typeof rawPic === "string" && rawPic)
          ? rawPic.replace(/fullsize\.webp$/, "medium.webp")
          : DEFAULT_AVATAR;

        kickAvatars.set(user, avatarUrl);
        return avatarUrl;
    }
    
    catch (error) {
        console.warn(`[Kick] Error getting Kick avatar for ${user}:`, error);
        return DEFAULT_AVATAR;
    }
}


async function getKickEmotes(text) {
    var message = await parseKickEmojis(text);
    message = await parseKick7TVEmotes(message);
    return message;
}

async function parseKickEmojis(content) {
    const message = content;
    const messagewithemotes = message.replace(/\[emote:(\d+):([^\]]+)\]/g, (_, id, name) => {
        return `<img src="https://files.kick.com/emotes/${id}/fullsize" alt="${name}" class="emote" >`;
    });

    return messagewithemotes;
}

async function parseKick7TVEmotes(text) {
    const words = text.split(/\s+/);

    const parsedWords = words.map(word => {
        if (kick7TVEmojis.has(word)) {
            const url = kick7TVEmojis.get(word);
            return `<img src="${url}" alt="${word}" class="emote" />`;
        }
        return word;
    });

    return parsedWords.join(' ');
}


async function getKick7TVEmotes(userId) {
    const userSet = await fetch(`https://7tv.io/v3/users/kick/${userId}`);

    if (userSet.status === 404) {
        console.debug("[Kick] 7TV Profile based on this Kick user was not found");
        return null;
    }

    const userEmojis = await userSet.json();
    
    const gettingAllKick7TVEmotes = userEmojis?.emote_set?.emotes?.map(emote => ({
        name: emote.name,
        id: emote.id,
        url: `https://cdn.7tv.app/emote/${emote.id}/1x.webp`
    })) || [];

    const globalSet = await fetch(`https://7tv.io/v3/emote-sets/global`);
    const globalEmojis = await globalSet.json();
    
    const gettingAllGlobal7TVEmotes = globalEmojis?.emotes?.map(emote => ({
        name: emote.name,
        id: emote.id,
        url: `https://cdn.7tv.app/emote/${emote.id}/1x.webp`
    })) || [];

    const SevenTVEmotesFusion = [...gettingAllKick7TVEmotes, ...gettingAllGlobal7TVEmotes];
    
    if (SevenTVEmotesFusion != null) {
        console.debug("[Kick] Getting all Kick's user 7TV Emojis + Globals", SevenTVEmotesFusion);

        SevenTVEmotesFusion.forEach(emote => {
            kick7TVEmojis.set(emote.name, emote.url);
        });
    }
}

async function getKickBadges(badges) {
    const badgesArray = [];
    
    badges.forEach(badge => {
        if (badge.type === 'subscriber') {
            
            const targetMonths = badge.count;

            // Sort badges by months 
            const eligibleBadges = kickSubBadges
                .filter(badge => badge.months <= targetMonths)
                .sort((a, b) => b.months - a.months); // sorts from highest to lowest

            badgesArray.push(`<img src="${eligibleBadges[0]?.badge_image?.src || 'icons/badges/kick-subscriber.svg'}" class="badge">`);
        }
        else {
            badgesArray.push(`<img src="js/modules/kick/images/badge-${badge.type}.svg" class="badge">`);
        }
    });

    return badgesArray.join(' ');
}

