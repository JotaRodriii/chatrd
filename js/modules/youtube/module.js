/* ------------------------ */
/* YOUTUBE MODULE VARIABLES */
/* ------------------------ */

const showYoutube                       = getURLParam("showYoutube", false);
const showYouTubeMessages               = getURLParam("showYouTubeMessages", true);
const showYouTubeSuperChats             = getURLParam("showYouTubeSuperChats", true);
const showYouTubeSuperStickers          = getURLParam("showYouTubeSuperStickers", true);
const showYouTubeSuperStickerGif        = getURLParam("showYouTubeSuperStickerGif", true);
const showYouTubeMemberships            = getURLParam("showYouTubeMemberships", true);
const showYouTubeGiftMemberships        = getURLParam("showYouTubeGiftMemberships", true);
const showYouTubeMembershipsTrain       = getURLParam("showYouTubeMembershipsTrain", true);
const showYouTubeStatistics             = getURLParam("showYouTubeStatistics", true);

let youTubeCustomEmotes = [];
let youTubeBTTVEmotes = [];

userColors.set('youtube', new Map());

// YOUTUBE EVENTS HANDLERS

const youtubeMessageHandlers = {
    'YouTube.Message': (response) => {
        youTubeChatMessage(response.data);
    },
    'YouTube.UserBanned': (response) => {
        youTubeUserBanned(response.data);
    },
    'YouTube.SuperChat': (response) => {
        youTubeSuperChatMessage(response.data);
    },
    'YouTube.SuperSticker': (response) => {
        youTubeSuperStickerMessage(response.data);
    },
    'YouTube.NewSponsor': (response) => {
        youTubeNewSponsorMessage(response.data);
    },
    'YouTube.MemberMileStone': (response) => {
        youTubeNewSponsorMessage(response.data);
    },
    'YouTube.MembershipGift': (response) => {
        youTubeGiftBombMessage(response.data);
    },
    'YouTube.GiftMembershipReceived': (response) => {
        youTubeGiftBombReceivedMessage(response.data);
    },
    'YouTube.StatisticsUpdated': (response) => {
        youTubeUpdateStatistics(response.data);
    },
    'YouTube.BroadcastUpdated': (response) => {
        youTubeAddStatistics(response.data);
    }
};

const youtubeStatistics = `
    <div class="platform youtube" id="youtube" style="display: none;">
        <img src="js/modules/youtube/images/logo-youtube.svg" alt="">
        <span class="viewers"><i class="fa-solid fa-user"></i> <span>0</span></span>
        <span class="likes"><i class="fa-solid fa-thumbs-up"></i> <span>0</span></span>
        <span class="title"></span>
    </div>
`;


if (showYoutube) {
    document.querySelector('#statistics').insertAdjacentHTML('beforeend', youtubeStatistics);

    if (showTwitchViewers == true) { document.querySelector('#youtube').style.display = ''; }

    registerPlatformHandlersToStreamerBot(youtubeMessageHandlers, '[YouTube]');
}




// ---------------------------
// YOUTUBE EVENT FUNCTIONS

async function youTubeChatMessage(data) {
    
    if (showYouTubeMessages == false) return;
    if (ignoreUserList.includes(data.user.name.toLowerCase())) return;
    if (data.message.startsWith("!") && excludeCommands == true) return;

	const template = chatTemplate;
	const clone = template.content.cloneNode(true);
    const messageId = data.eventId;
    const userId = data.user.id;
    const broadcastId = data.broadcast.id;

    const root = clone.querySelector(".item");
    root.dataset.broadcast = broadcastId;

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

    const classes = ['youtube', 'chat'];

    const [badgeList] = await Promise.all([
        getYouTubeBadges(data)
    ]);

    header.remove();
    firstMessage.remove();
    sharedChat.remove();
    reply.remove();
    pronoun.remove();

    var color = await createRandomColor('youtube', data.user.name);

    user.style.color = color;
    user.textContent = data.user.name;

    
    message.textContent = data.message;
    await getYouTubeEmotes(data, message);

    if (showAvatar) avatar.innerHTML = `<img src="${data.user.profileImageUrl}">`; else avatar.remove();
    if (showBadges) badges.innerHTML = badgeList; else badges.remove();

    if (data.user.isOwner) { classes.push('streamer'); }

    addMessageItem('youtube', clone, classes, userId, messageId);
}




async function youTubeSuperChatMessage(data) {

    if (showYouTubeSuperChats == false) return;

    const template = eventTemplate;
	const clone = template.content.cloneNode(true);
    const messageId = data.eventId;
    const userId = data.user.id;

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

    const classes = ['youtube', 'superchat'];

    header.remove();

    
    user.textContent = data.user.name;
    action.innerHTML = ` superchatted `;
    value.innerHTML = `<strong>${data.amount}</strong>`;

    message.textContent = data.message;
    await getYouTubeEmotes(data, message);

    addEventItem('youtube', clone, classes, userId, messageId);
}



async function youTubeSuperStickerMessage(data) {
    
    if (showYouTubeMemberships == false) return;

    const template = eventTemplate;
	const clone = template.content.cloneNode(true);
    const messageId = data.eventId;
    const userId = data.user.id;

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

    const classes = ['youtube', 'sticker'];

    if (showYouTubeSuperStickerGif == true) {
        youtubeStickerUrl = await getYouTubeStickerImage(data);
        header.innerHTML = `<img src="${youtubeStickerUrl}" class="sticker">`;
    }
    else {
        header.remove();
    }
    
    user.textContent = data.user.name;
    action.innerHTML = ` sent a supersticker `;

    value.innerHTML = `<strong>(${data.amount})</strong>`;
    
    message.remove();

    addEventItem('youtube', clone, classes, userId, messageId);
}



async function youTubeNewSponsorMessage(data) {
    
    if (showYouTubeMemberships == false) return;

    const template = eventTemplate;
	const clone = template.content.cloneNode(true);
    const messageId = data.eventId;
    const userId = data.user.id;

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

    const classes = ['youtube', 'sponsor'];

    header.remove();

    
    user.textContent = data.user.name;
    action.innerHTML = ` became a member for `;

    //var months = data.months > 1 ? 'months' : 'month';
    var months = formatSubMonthDuration(data.months);
    value.innerHTML = `<strong>${months}</strong>`;

    if (data.message) {
        message.textContent = data.message;
        await getYouTubeEmotes(data, message);
    }
    else { message.remove(); }

    addEventItem('youtube', clone, classes, userId, messageId);
}



async function youTubeGiftBombMessage(data) {
    
    if (showYouTubeMemberships == false || showYouTubeGiftMemberships == false) return;

    const template = eventTemplate;
	const clone = template.content.cloneNode(true);
    const messageId = data.eventId;
    const userId = data.user.id;

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

    const classes = ['youtube', 'giftbomb'];

    header.remove();

    
    user.textContent = data.user.name;
    action.innerHTML = ` gifted `;

    var count = data.count > 1 ? 'memberships' : 'membership';
    value.innerHTML = `<strong>${data.count} ${count} (Tier ${data.tier})</strong> to the channel`;

    message.remove();

    addEventItem('youtube', clone, classes, userId, messageId);
}



async function youTubeGiftBombReceivedMessage(data) {
    
    if (showYouTubeMemberships == false || showYouTubeGiftMemberships == false || showYouTubeMembershipsTrain == false) return;

    const template = eventTemplate;
	const clone = template.content.cloneNode(true);
    const messageId = data.eventId;
    const userId = data.user.id;

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

    const classes = ['youtube', 'giftbomb'];

    header.remove();

    
    user.textContent = data.gifter.name;
    action.innerHTML = ` gifted a membership to `;
    value.innerHTML = `<strong>${escapeHTML(data.user.name)}</strong>`;

    message.remove();

    addEventItem('youtube', clone, classes, userId, messageId);
}



async function youTubeUserBanned(data) {
    chatContainer.querySelectorAll(`[data-user="${data.bannedUser.id}"]:not(.event)`).forEach(element => {
        element.remove();
    });
}



async function youTubeAddStatistics(data) {
    
    if (showPlatformStatistics == false || showYouTubeStatistics == false) return;
    
    const status = data.status;
    const id = data.id;
    const title = data.title;
    const elementId = `youtubeStream-${id}`;

    if (status == 'live') {

        const original = document.querySelector('#statistics #youtube');
        if (original) original.remove();

        if (!document.querySelector( `#${elementId}` )) {
            let youtubeStatisticsHTML = youtubeStatistics.replace(`id="youtube"`, `id="${elementId}"`);
            document.querySelector('#statistics').insertAdjacentHTML('beforeend', youtubeStatisticsHTML);

            const streamelement = document.querySelector(`#${elementId}`);
            const streamtitle = streamelement.querySelector(`#${elementId} .title`);
            
            streamtitle.textContent = title;
            streamelement.setAttribute('title', title);
            
            if (showYouTubeStatistics == true) {
                for (const el of document.querySelectorAll('.youtube')) {
                    el.style.display = '';
                }
            }
        }
        else {
            document.querySelector(`#${elementId} .title`).textContent = title;
        }
    }
    else if (status == 'complete') {
        const streamelement = document.querySelector(`#${elementId}`);
        streamelement.remove();

        const youtubeStreamBoxes = document.querySelectorAll('.youtube').length;

        if (youtubeStreamBoxes == 0) {
            document.querySelector('#statistics').insertAdjacentHTML('beforeend', youtubeStatistics);
            document.querySelector('#youtube').style.display = '';
        }
        
    }
}


async function youTubeUpdateStatistics(data) {
    
    if (showPlatformStatistics == false || showYouTubeStatistics == false) return;
    
    const id = data.broadcast.id;
    const viewers = formatNumber(DOMPurify.sanitize(data.concurrentViewers)) || "0";
    const likes = formatNumber(DOMPurify.sanitize(data.likeCount)) || "0";

    youTubeAddStatistics({
        status: data.broadcast.status,
        id: id,
        title: data.broadcast.title
    })

    document.querySelector(`#statistics #youtubeStream-${id} .viewers span`).textContent = formatNumber(viewers);
    document.querySelector(`#statistics #youtubeStream-${id} .likes span`).textContent = formatNumber(likes);
}




        







// ---------------------------
// YOUTUBE UTILITY FUNCTIONS



async function getYouTubeEmotes(data, messageElement) {
    let message = data.message;
    const channelId = data.broadcast?.channelId;
    if (!channelId) return;

    // carrega os emotes customizados
    if (youTubeCustomEmotes.length == 0) {
        streamerBotClient.getGlobals().then((getglobals) => {
            youTubeCustomEmotes = JSON.parse(JSON.parse(getglobals.variables.chatrdytcustomemotes.value));
            console.debug('[YouTube] Getting YouTube Emotes from Streamer.Bot', youTubeCustomEmotes);
        });
    }

    // carrega os BTTV emotes se não carregados ainda
    if (youTubeBTTVEmotes.length === 0) {
        try {
            const res = await fetch(`https://api.betterttv.net/3/cached/users/youtube/${channelId}`);
            const emoteData = await res.json();
            console.debug('[YouTube] Getting BTTV Channel Emotes', `https://api.betterttv.net/3/cached/users/youtube/${channelId}`, emoteData);
            youTubeBTTVEmotes = [
                ...(emoteData.sharedEmotes || []),
                ...(emoteData.channelEmotes || [])
            ];
            if (youTubeBTTVEmotes.length === 0) {
                console.debug('[YouTube] No BTTV Emotes found. Setting fake data so we avoid fetching the emotes again.');
                youTubeBTTVEmotes = [
                    { code: 'fakeemote', id: 'fakeemote' }
                ];
            }
        }
        catch (err) {
            console.warn("[YouTube] Failed to load BTTV emotes:", err);
        }
    }

    // Helper: Twemoji URL
    function getTwemojiUrl(emoji) {
        const codePoints = Array.from(emoji).map(c => c.codePointAt(0).toString(16));
        let fileName = codePoints.join('-');
        fileName = fileName.replace(/-fe0f/g, ''); // remove FE0F
        return `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/${fileName}.png`;
    }

    // Limpa o elemento
    messageElement.innerHTML = '';

    // monta um mapa de emotes (nome → URL)
    const emoteMap = new Map();

    // BTTV emotes
    for (const emote of youTubeBTTVEmotes) {
        emoteMap.set(emote.code, `https://cdn.betterttv.net/emote/${emote.id}/1x`);
    }

    // YouTube emotes (Twemoji + normais)
    if (data.emotes) {
        for (const emote of data.emotes) {
            let emoteUrl = emote.imageUrl;
            if (String(emote.type || "").toLowerCase() === "twemoji") {
                emoteUrl = getTwemojiUrl(emote.name);
            }
            if (!emoteUrl || emoteUrl.trim() === '') continue;
            emoteMap.set(emote.name, emoteUrl);
        }
    }

    // Custom Member Emotes
    if (data.user.isSponsor === true || data.user.isOwner === true) {
        for (const [name, url] of Object.entries(youTubeCustomEmotes)) {
            emoteMap.set(`:${name}:`, url);
        }
    }

    // Nova quebra: detecta tokens de emotes/emoji mesmo colados
    const tokenRegex = /(:[a-zA-Z0-9_\-]+:)|([\p{Emoji_Presentation}\p{Extended_Pictographic}])/gu;
    let parts = [];
    let lastIndex = 0;

    for (const match of message.matchAll(tokenRegex)) {
        // texto antes do emote
        if (match.index > lastIndex) {
            parts.push(message.slice(lastIndex, match.index));
        }
        // o próprio emote/emoji
        parts.push(match[0]);
        lastIndex = match.index + match[0].length;
    }
    // resto do texto
    if (lastIndex < message.length) {
        parts.push(message.slice(lastIndex));
    }

    // monta a mensagem final
    for (const part of parts) {
        if (emoteMap.has(part)) {
            const img = document.createElement('img');
            img.src = emoteMap.get(part);
            img.alt = part;
            img.className = 'emote';
            img.onerror = () => (img.outerHTML = part);
            messageElement.appendChild(img);
        } else {
            messageElement.appendChild(document.createTextNode(part));
        }
    }
}





// ChatGPT created this. :)
async function getYouTubeStickerImage(data) {
    const stack = [data];

    while (stack.length) {
        const current = stack.pop();

        if (current && typeof current === 'object') {
            if ('imageUrl' in current && typeof current.imageUrl === 'string') {
                return current.imageUrl;
            }

            for (const key in current) {
                if (Object.hasOwn(current, key)) {
                    stack.push(current[key]);
                }
            }
        }
    }

    return null;
}

async function getYouTubeBadges(data) {
    const {
        user: {
            isVerified,
            isSponsor,
            isModerator,
            isOwner,
        }
    } = data;

    let badgesHTML = [
        isVerified && '<span class="badge verified"><i class="fa-solid fa-check"></i></span>',
        isSponsor && '<span class="badge member"><i class="fa-solid fa-star"></i></span>',
        isModerator && '<span class="badge mod"><i class="fa-solid fa-wrench"></i></span>',
        isOwner && '<span class="badge owner"><i class="fa-solid fa-video"></i></span>',
    ].filter(Boolean).join('');

    return badgesHTML;
}