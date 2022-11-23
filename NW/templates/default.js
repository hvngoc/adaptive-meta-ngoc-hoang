window.onload = function () {
    function receiveMessage(e) {
        if (e.data.id === "font-ratio") {
            var value = e.data.value;
            if (value >= 75 && value <= 200) {
                document.documentElement.style.setProperty("--font-size-ratio", value + "%");
            }
        } else if (e.data.id === "line-spacing-ratio") {
            var value = e.data.value;
            if (value >= 0 && value <= 1) {
                document.documentElement.style.setProperty("--line-spacing-ratio", value + "em");
            }
        } else if (e.data.id === "colors") {
            var value = e.data.value;
            if (value) {
                var primaryBg = value.primaryBackground;
                var primaryFg = value.primaryForeground;
                var primaryFgH = value.primaryForegroundHightlight;
                var secondaryBg = value.secondaryBackground;
                var secondaryFg = value.secondaryForeground;
                if (primaryBg) {
                    document.documentElement.style.setProperty("--color-primary-bg", primaryBg);
                }
                if (primaryFg) {
                    document.documentElement.style.setProperty("--color-primary-fg", primaryFg);
                }
                if (primaryFgH) {
                    document.documentElement.style.setProperty("--color-primary-fg-highlight", primaryFgH);
                }
                if (secondaryBg) {
                    document.documentElement.style.setProperty("--color-secondary-bg", secondaryBg);
                }
                if (secondaryFg) {
                    document.documentElement.style.setProperty("--color-secondary-fg", secondaryFg);
                }
            }
        }
    }
    
    var sendMessage = function (msg) {
        // Make sure you are sending a string, and to stringify JSON
        window.parent.postMessage(msg, '*');
    };
    
    window.addEventListener('message', receiveMessage);
    
    // Swipe management
    var touchstartX = 0;
    var touchstartY = 0;
    var touchendX = 0;
    var touchendY = 0;
    
    var gesuredZone = document.getElementsByTagName("BODY")[0];
    
    gesuredZone.addEventListener('touchstart', function (event) {
                                 touchstartX = event.changedTouches[0].screenX;
                                 touchstartY = event.changedTouches[0].screenY;
                                 }, false);
    
    gesuredZone.addEventListener('touchend', function (event) {
                                 touchendX = event.changedTouches[0].screenX;
                                 touchendY = event.changedTouches[0].screenY;
                                 handleGesure();
                                 }, false);
    
    function handleGesure() {
        var swiped = 'swiped: ';
        if (touchendX < (touchstartX - 100)) {
            sendMessage("swipe_left");
        }
        if (touchendX > (touchstartX + 100)) {
            sendMessage("swipe_right");
        }
    }
    
    function findMediaAncestor (el, cls) {
        while ((el = el.parentElement) && el != null  & el.classList != null && !el.classList.contains(cls));
        
        if(el == null || el.classList == null || !el.classList.contains(cls)){
            return null;
        }
        return el;
    }
    
    function launchMediaClicked(message, e) {
        if (typeof notifyMediaClicked === 'function') {
            console.log('it has a notify method');
            notifyMediaClicked(message, e);
        }
        else {
            console.log('it does not has a notify method');
            var jsonStr = JSON.stringify(message);
            sendMessage(jsonStr);
        }
    }
    
    function elemMediaClick(e) {
        e = e || window.event; var target = e.target || e.srcElement;
        
        var media= findMediaAncestor(target, "media");
        if(media!= null) {
            var img = media.getElementsByTagName("img")[0];
            var fullPath = img.src;
            var startIndex = (fullPath.indexOf('\\') >= 0 ? fullPath.lastIndexOf('\\') : fullPath.lastIndexOf('/'));
            var mediaId = fullPath.substring(startIndex);
            if (mediaId.indexOf('\\') === 0 || mediaId.indexOf('/') === 0) {
                mediaId = mediaId.substring(1);
            }
            var legend ="", producer="";
            if(media.getElementsByClassName("medialegend").length > 0){
                legend = media.getElementsByClassName("medialegend")[0].textContent;
            }
            if(media.getElementsByClassName("mediaproducer").length > 0){
                producer = media.getElementsByClassName("mediaproducer")[0].textContent;
            }
            console.log("ID : " + mediaId
                        + "\nLegend : " + legend
                        + "\nProducer : " + producer
                        + "\nElem: " + e.target) ;
            var message ={};
            message.type= "media-clicked";
            message.mediaList = [];
            var group= findMediaAncestor(target, "media-group");
            if( group != null){
                console.log("GROUP :" + group);
                for(var i=0; i< group.children.length; i++){
                    var nodeInfo ={};
                    media = group.children[i];
                    img = media.getElementsByTagName("img")[0];
                    fullPath = img.src;
                    nodeInfo.fullPath = fullPath;
                    startIndex = (fullPath.indexOf('\\') >= 0 ? fullPath.lastIndexOf('\\') : fullPath.lastIndexOf('/'));
                    nodeInfo.mediaId = fullPath.substring(startIndex);
                    if (nodeInfo.mediaId.indexOf('\\') === 0 || nodeInfo.mediaId.indexOf('/') === 0) {
                        nodeInfo.mediaId = nodeInfo.mediaId.substring(1);
                    }
                    nodeInfo.mediaLegend ="";
                    nodeInfo.mediaProducer="";
                    if(media.getElementsByClassName("medialegend").length > 0){
                        nodeInfo.mediaLegend = media.getElementsByClassName("medialegend")[0].textContent;
                    }
                    if(media.getElementsByClassName("mediaproducer").length > 0){
                        nodeInfo.mediaProducer = media.getElementsByClassName("mediaproducer")[0].textContent;
                    }
                    message.mediaList[i] = nodeInfo;
                    if(nodeInfo.mediaId == mediaId){
                        message.selectedIndex = i;
                    }
                }
                message.timestamp= Math.floor(Date.now());
                launchMediaClicked(message, e);
            }
            else {
                var nodeInfo ={};
                nodeInfo.mediaId = mediaId;
                nodeInfo.mediaLegend =legend;
                nodeInfo.mediaProducer = producer;
                nodeInfo.fullPath = fullPath;
                message.mediaList[0] = nodeInfo;
                message.selectedIndex = 0;
                message.timestamp= Math.floor(Date.now());
                launchMediaClicked(message, e);
            }
        }else{
            if (typeof clickedOutsideMedia === 'function') {
                clickedOutsideMedia();
            }
            else {
                sendMessage("clicked_outside_media");
            }
        }
    }
    
    function initMediaClickIfNecessary(){
        console.log('initMediaClickIfNecessary launched');
        if (!initMediaClickIfNecessary.didrun){
            initMediaClickIfNecessary.didrun = true;
            console.log('initMediaClickIfNecessary executed');
            document.body.removeEventListener('click', elemMediaClick, true);
            document.body.addEventListener('click',  elemMediaClick, true);
        }
    }
    
    initMediaClickIfNecessary();
};
