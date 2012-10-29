
/** Chilly bot
    version 1.0
	this bot runs on turntable fm, simply switch out the auth, userid, and roomid,
	and it will work with any account.
	credits: a big thanks to the people at the turntable api for all the input they gave
	me on the script. also a thanks to MikeWillis for his awesome song randomize algorithm.
	and a credit to alaingilbert for his help and the afk timer pattern. thanks to DubbyTT also for 
	the song skipping algorithm.
*/

var Bot    = require('ttapi');
var AUTH   = 'xxxxxxxxxxxxxxxxxxxxxxxx';   //set the auth of your bot here.
var USERID = 'xxxxxxxxxxxxxxxxxxxxxxxx';   //set the userid of your bot here.
var ROOMID = 'xxxxxxxxxxxxxxxxxxxxxxxx';   //set the roomid of the room you want the bot to go to here.
var roomName = 'straight chillin' //put your room's name here.
var playLimit = 4; //set the playlimit here (default 4 songs)
var songLengthLimit = 8; //set song limit in minutes, set to zero for no limit
var myId = null;
var detail = null;
var current = null;
var name = null;
var flag = null;
var dj = null;
var condition = null;
var index = null;
var song = null;
var album = null;
var genre = null;
var skipOn = null;
var queue = false;
var songCount = 0;
var stageCount = 1;
var snagSong = null;
var lastSeen = {};
var AFK = false;
var MESSAGE = false;
var checkWhoIsDj;
var GREET = true;
var djs20 = [];
var randomOnce = 0;

global.theUsersList = [];
global.blackList = [];
global.modList = [];
global.escortList = [];
global.currentDjs = [];
global.playList = [];
global.queueList = [];
global.queueName = [];
global.playListIds = [];
global.curSongWatchdog = null;
global.takedownTimer = null;
global.lastdj = null;
global.checkLast = null;
global.songLimitTimer = null;

var bot = new Bot(AUTH, USERID, ROOMID);
bot.tcpListen(xxxx, 'xxx.x.x.x'); //set the port and ip that you want the bot use here.
bot.listen(xxxx, 'xxx.x.x.x');



//prints all debugging information to the console in real time (alot of data)
bot.debug = false;



//updates the afk list
justSaw = function (uid) {
   return lastSeen[uid] = Date.now();
};


//checks if a person is afk or not
isAfk = function (userId, num) {
   var last = lastSeen[userId];
   var age_ms = Date.now() - last;
   var age_m = Math.floor(age_ms / 1000 / 60);
   if (age_m >= num) {
      return true;
   };
   return false;
};



//removes afk dj's after afklimit is up.
afkCheck = function () {
   var afkLimit = 20; //An Afk Limit of 20 minutes.
   for (i = 0; i < currentDjs.length; i++) {
      afker = currentDjs[i]; //Pick a DJ
      if ((isAfk(afker, afkLimit)) && AFK == true) { //if Dj is afk then
	   var isAfkMod = modList.indexOf(afker);
	   var whatIsAfkerName = theUsersList.indexOf(afker) + 1;
	     if(afker != USERID && isAfkMod == -1 && afker != checkWhoIsDj) //checks to see if afker is a mod or a bot or the current dj, if they are is does not kick them.
		 {	
         bot.speak('@' +theUsersList[whatIsAfkerName]+ ' you are over the afk limit of ' +afkLimit+ ' minutes.');
         bot.remDj(afker); //remove them
		 }
      }; 
   };
};
setInterval(afkCheck, 5000) //This repeats the check every five seconds.



repeatAfkMessage = function () {
if(AFK == true)
  {
bot.speak('The afk limit is currently active, please chat or awesome to reset your timer.'); //this is your afk message.
  };
};

setInterval(repeatAfkMessage, 600 * 1000) //repeats every 10 minutes if afk is set to on.



repeatMessage = function () {
if(MESSAGE == true)
  {
bot.speak('Welcome to straight chillin the rules are blablabla.'); //set the message you wish the bot to repeat here i.e rules and such.
  };
};

setInterval(repeatMessage, 900 * 1000)  //repeats this message every 15 mins if /messageOn has been used.





bot.on('newsong', function (data){ 
  var length = data.room.metadata.current_song.metadata.length;

  
    //this is for the song length limit
  if(songLimitTimer != null) {
    clearTimeout(songLimitTimer);
    songLimitTimer = null;
    bot.speak("@"+theUsersList[checkLast+1]+", Thanks buddy ;-)");	
  }
  
  
  // If watch dog has been previously set, 
  // clear since we've made it to the next song
  if(curSongWatchdog != null) {
    clearTimeout(curSongWatchdog);
    curSongWatchdog = null;
  }
  
  
  // If takedown Timer has been set, 
  // clear since we've made it to the next song
  if(takedownTimer != null) {
    clearTimeout(takedownTimer);
    takedownTimer = null;
    bot.speak("@"+theUsersList[checkLast+1]+", Thanks buddy ;-)");	
  }

  
  // Set this after processing things from last timer calls
  lastdj = data.room.metadata.current_dj;
  checkLast = theUsersList.indexOf(lastdj);
  var modIndex = modList.indexOf(lastdj);
  

  
  // Set a new watchdog timer for the current song.
  
    curSongWatchdog = setTimeout( function() {
      curSongWatchdog = null;
      bot.speak("@"+theUsersList[checkLast+1]+", you have 20 seconds to skip your stuck song before you are removed");
      //START THE 20 SEC TIMER
      takedownTimer = setTimeout( function() {
        takedownTimer = null;
        bot.remDj(lastdj); // Remove Saved DJ from last newsong call
      }, 20 * 1000); // Current DJ has 20 seconds to skip before they are removed
    }, (length + 10) * 1000); // Timer expires 10 seconds after the end of the song, if not cleared by a newsong
  
   
   //this boots the user if their song is over the length limit
   if((length / 60) >= songLengthLimit && songLengthLimit != 0 && modIndex == -1))
	  {
      bot.speak("@"+theUsersList[checkLast+1]+", your song is over " +songLengthLimit + " mins long, you have 20 seconds to skip before being removed.");
      //START THE 20 SEC TIMER
      songLimitTimer = setTimeout( function() {
        songLimitTimer = null;
        bot.remDj(lastdj); // Remove Saved DJ from last newsong call
      }, 20 * 1000); // Current DJ has 20 seconds to skip before they are removed
	  }

});





//checks at the beggining of the song
 bot.on('newsong', function (data) { 

 
 //adds a song to the end of your bots queue
if(snagSong == true)
 {
bot.playlistAll(function(playlist) {
  getSong = data.room.metadata.current_song._id;
  bot.playlistAdd(getSong, playlist.list.length); 
  console.log('DEBUGGING: ', getSong);
}); 
 }  
 
 
 //checks how many dj's are currently on the stage.
  var djsOnStage = data.room.metadata.djcount;

  
  
  if (queue == true && songCount != 1 && queueList.length != 0 && djsOnStage != 5)
  {
  songCount++;
  bot.speak('@' + queueName[0] + ' you have: ' + stageCount + ' song to get on stage.');
  stageCount--;
  }
  else if (songCount == 1)
  {
  queueList.splice(0, 2);
  queueName.splice(0, 1);
  songCount = 0;
  stageCount = 1;
  }   
  
  
 var userId = USERID; // the bots userid
 
 
 //used to check who the currently playing dj is.
 checkWhoIsDj = data.room.metadata.current_dj;
 var current = data.room.metadata.current_dj;
 
 
 //used to get current dj's name.
 dj = data.room.metadata.current_song.djname;
 bot.bop(); //automatically awesomes each song. will not awesome again until the next song.
 
 
 
 //used to have the bot skip its song if its the current player (if it has any)
 if(userId == current && skipOn == true)
 {
 bot.skip();
 }
 
 
 
 //puts bot on stage if there is one dj on stage, and removes them when there is 5 dj's on stage.
 current = data.room.metadata.djcount;
 if(current == 1)
 {
 bot.addDj();
 current = null;
 }
 
 if(current == 5)
 {
 bot.remDj();
 current = null;
 } 
 });

 
 //bot gets on stage and starts djing if no song is playing.
bot.on('nosong', function (data) {
bot.addDj();
skipOn = false; })




//checks when the bot speaks
bot.on('speak', function (data) {  
  // Get the data
  var text = data.text;
  //name of person doing the command.
   name = data.name;   
  
  //checks to see if the speaker is a moderator or not.
   var modIndex = modList.indexOf(data.userid);  
    if (modIndex != -1)
	{
	condition = true;
	}
	else
	{
	condition = false;
	}
	
	//updates the afk position of the speaker.
	if(AFK == true);
	{
	justSaw(data.userid);
	}	
	
	
	

  if (text.match(/^\/autodj$/) && condition == true) {
    if(current < 5)
	{
    bot.addDj();
	current = null;
	}
  }  
  else if (text.match(/^\/randomSong$/) && condition == true && randomOnce != 1) {  
    bot.playlistAll(function(playlist) {
	            var i = 0;				
				bot.speak("Reorder initiated.");
				++randomOnce;
                var reorder = setInterval(function() {
                    if(i <= playlist.list.length) {
                        var nextId = Math.ceil(Math.random() * playlist.list.length);
                        bot.playlistReorder(i, nextId);
                        console.log("Song " + i + " changed.");
                        i++;
                    } else {
					    
                        clearInterval(reorder);
                        console.log("Reorder Ended");
                        bot.speak("Reorder completed.");
						--randomOnce;
                    }
                }, 1000);
				
            });			    
  }  
  else if(text.match('/bumptop') && condition == true && queue == true)
  {
    var topOfQueue = data.text.slice(10);
	var index35 = queueList.indexOf(topOfQueue);
	var index46 = queueName.indexOf(topOfQueue);
	var index80 = theUsersList.indexOf(topOfQueue);	
	var index81 = theUsersList[index80];
	var index82 = theUsersList[index80 - 1];
	if(index35 != -1 && index80 != -1)
	{
	queueList.splice(index35, 2);
	queueList.unshift(index81, index82);
	queueName.splice(index46, 1);
	queueName.unshift(index81);    
	bot.speak('The queue is now: ' + queueName);
	}
  } 
   else if(text.match(/^\/afkon/) && condition == true)
  {
    AFK = true;
	bot.speak('the afk list is now active.');	
  }  
  else if(text.match(/^\/afkoff/) && condition == true)
  {
    AFK = false;
	bot.speak('the afk list is now inactive.');	
  }  
  else if(text.match(/^\/skipsong/) && condition == true)
  {
    bot.skip();
  }  
  else if(text.match(/^\/props/))
  {
    bot.speak('@'+name+ ' gives ' + '@' +dj+ ' an epic high :hand:');
  }  
  else if(text.match(/^\/greeton/) && condition == true)
  {
    bot.speak('room greeting: On');
    GREET = true;
  } 
  else if(text.match(/^\/greetoff/) && condition == true)
  {
    bot.speak('room greeting: Off');
    GREET = false;
  } 
  else if(text.match(/^\/messageOn/) && condition == true)
  {
    bot.speak('message: On');
    MESSAGE = true;
  }  
  else if(text.match(/^\/messageOff/) && condition == true)
  {
    bot.speak('message: Off');
    MESSAGE = false;
  }  
  else if(text.match(/^\/commands/))
  {
   bot.speak('the commands are  /awesome, ' +
             ' /mom, /chilly, /hello, /escortme, /stopescortme, /fanme, /unfanme, /roominfo, /beer, /dice, /props, /m, /getTags, /admincommands, /queuecommands');
  }  
  else if(text.match(/^\/queuecommands/))
  {
   bot.speak('the commands are /queue, /removefromqueue, /removeme, /addme, /queueOn, /queueOff, /bumptop');
  }  
  else if(text.match('/admincommands') && condition == true)
  {
   bot.pm('the mod commands are /ban, /unban, /skipon, /skipoff, /stage, /randomSong, /messageOn, /messageOff, /afkon, /afkoff, /skipsong, /autodj, /removedj, /lame, ' +
          '/snagon, /snagoff, /removesong, /greeton, /greetoff', data.userid);
   condition = false;
  }  
  else if (text.match(/^\/tableflip/)) {
  bot.speak('/tablefix');  		
  }
  else if(text.match('awesome'))
  {
  bot.vote('up');
  }  
  else if(text.match('lame') && condition == true)
  {
  bot.vote('down');
  }
  else if (text.match(/^\/removedj$/) && condition == true) {
    bot.remDj();
  }
  else  if (text.match(/^\/mom$/)) 
    {
    bot.speak('@'+name+' ur mom is fat');
	}
  else if (text.match(/^\/chilly$/)) 
   {
    bot.speak('@'+name+' is pleasantly chilled.');
   }
   else if (text.match(/^\/skipon$/) && condition == true) 
   {
    bot.speak('i am now skipping my songs');
    skipOn = true;
   }
   else if (text.match(/^\/skipoff$/) && condition == true) 
   {
   bot.speak('i am no longer skipping my songs');
    skipOn = false;
   }
  else if (text.match(/^\/beer$/))
    {
    bot.speak('@chillybot hands '+ '@'+name+' a nice cold :beer:');
	}
  else if (data.text == '/escortme') 
   {	
    var djListIndex = currentDjs.indexOf(data.userid);
	var escortmeIndex = escortList.indexOf(data.userid);
	if(djListIndex != -1 && escortmeIndex == -1)
	{
	escortList.push(data.userid);	
	bot.speak('@' + name + ' you will be escorted after your next song');
	}
  }
  else if(data.text == '/stopescortme')
  {
  bot.speak('@' + name + ' you will no longer be escorted after your next song');
  var escortIndex = escortList.indexOf(data.userid);
  if(escortIndex != -1)
  {
  escortList.splice(escortIndex, 1);
  }
  }
  else if(data.text == '/roominfo')
  {
  bot.speak(detail);
  detail = null;
  }  
  else if(data.text == '/fanme')
  {
  bot.speak('@' + name + ' i am now your fan!');
  myId = data.userid;
  bot.becomeFan(myId);
  myId = null;
  }
  else if(data.text == '/getTags')
  {
  bot.speak('the last song was: ' + song + ', the album was: ' + album + ', the genre was: ' + genre);
  }
  else if(data.text == '/dice')
  {
  var num = 0;
  var random = Math.floor(Math.random() * 6 + 1);
  bot.speak('@' + name + ' i am rolling the dice...');
  num = 1;
  if(num =1)
   {
  bot.speak('your number is... ' +random);
  num = 0;
   }
  }  
  else if(data.text == '/unfanme')
  {
  bot.speak('@' + name + ' i am no longer your fan.');
  myId = data.userid;
  bot.removeFan(myId);
  myId = null;
  }
  else if (text.match(/^\/m/)) {
    bot.speak(text.substring(3));	
  }
  else if (text.match(/^\/hello$/)) {
    bot.speak('Hey! How are you @'+name+'?');
  }  
  else if (text.match(/^\/snagon$/) && condition == true)
  {  
    snagSong = true;
	bot.speak('snag: ON');
  }
   else if (text.match(/^\/snagoff$/) && condition == true)
  {  
    snagSong = false;
	bot.speak('snag: OFF');
  }
  
   else if (text.match(/^\/removesong$/) && condition == true)
  {  
     bot.playlistAll(function(playlist) {	 
	 if(checkWhoIsDj == USERID)
     {
	 var remove = playlist.list.length - 1;
     bot.skip();	 
     bot.playlistRemove(remove);
	 bot.speak('the last snagged song has been removed.');
	 }
     else
     {
     var remove = playlist.list.length - 1;	 
	 bot.playlistRemove(remove);
	 bot.speak('the last snagged song has been removed.');
	 }
	})
  }
  else if (text.match(/^\/queue$/))
  {  
    if(queue == true)
	{
	bot.speak('The queue is now: ' + queueName);
	}
	else
	{
	bot.speak('There is currently no queue.');
	}	
  }
  else if (text.match('/removefromqueue') && queue == true && condition == true) {  
	var removeFromQueue = data.text.slice(18);
	var index5 = queueList.indexOf(removeFromQueue);
	var index6 = queueName.indexOf(removeFromQueue);
	if(index5 != -1)
	{
    queueList.splice(index5, 2);
	queueName.splice(index6, 1);
	bot.speak('The queue is now: ' + queueName);
	}	
  }
  else if (text.match(/^\/removeme$/) && queue == true) {  
	var list1 = queueList.indexOf(data.name);
	if(list1 != -1)
	{
	queueList.splice(list1, 2);
	}
	var list2 = queueName.indexOf(data.name);
	if(list2 != -1)
	{
	queueName.splice(list2, 1);
	bot.speak('The queue is now: ' + queueName);
	}	
  }
  else if (text.match(/^\/addme$/) && queue == true) {  
	var list3 = queueList.indexOf(data.name);
	var list10 = currentDjs.indexOf(data.userid)
	if(list3 == -1 && list10 == -1)
	{
	queueList.push(data.name, data.userid);
	queueName.push(data.name);
	bot.speak('The queue is now: ' + queueName);
	}	
  }
  else if (text.match(/^\/queueOn$/) && condition == true) {  
    bot.speak('the queue is now active.');
	queue = true;	
	for (var i = 0; i < currentDjs.length; i++){
	djs20[currentDjs[i]] = { nbSong: 0 };
    }  
  }
  else if (text.match(/^\/queueOff$/) && condition == true) {  
    bot.speak('the queue is now inactive.');
	queue = false;
  }
   else if(text.match('/stage') && condition == true)
  {  
  var ban = data.text.slice(8);
  var checkUser = theUsersList.indexOf(ban) -1;
  if (checkUser != -1)
  {
     bot.remDj(theUsersList[checkUser]);
	 condition = false;
    }
  }    
  else if(text.match('/ban') && condition == true)
  {  
  var ban = data.text.slice(6);
  var checkBan = blackList.indexOf(ban);
  var checkUser = theUsersList.indexOf(ban);
  if (checkBan == -1)
  {
      blackList.push(theUsersList[checkUser-1], theUsersList[checkUser]);
	  bot.boot(theUsersList[checkUser-1]);		  
	  condition = false;
    }
  }  
  else if(text.match('/unban') && condition == true)
  {
  var ban2 = data.text.slice(8);
  index = blackList.indexOf(ban2);
   if(index != -1)
   {    
      blackList.splice(blackList[index-1], 2);	 
	  console.log('DEBUGGING: ', blackList);
      condition = false;	  
	  index = null;
    }
  }   
});


//checks who voted and updates their position on the afk list.
bot.on('update_votes', function (data) {
if(AFK == true);
	{
	justSaw(data.room.metadata.votelog[0][0]);
	}
 })


//checks who added a song and updates their position on the afk list. 
bot.on('snagged', function (data) {
if(AFK == true);
	{
	justSaw(data.userid);
	}
 })





//checks when a dj leaves the stage
bot.on('rem_dj', function (data) {


//removes user from the dj list when they leave the stage
delete djs20[data.user[0].userid];


//updates the current dj's list.
if(AFK == true);
{
var check30 = currentDjs.indexOf(data.user[0].userid);
currentDjs.splice(check30, 1);
}



//takes a user off the escort list if they leave the stage.
var checkEscort = escortList.indexOf(data.user[0].userid);

var user = data.user;
if (checkEscort != -1)
{
escortList.splice(checkEscort, 1);
}
var checkDj = currentDjs.indexOf(data.user[0].userid);

if (checkDj != -1)
{
currentDjs.splice(checkDj, 1);
}
 })
 

 
 //this activates when a user joins the stage.
bot.on('add_dj', function (data) {


//sets dj's songcount to zero when they enter the stage.
djs20[data.user[0].userid] = { nbSong: 0 };


//checks if user is a moderator.
 var modIndex = modList.indexOf(data.user[0].userid);
    if (modIndex != -1)
	{
	condition = true;
	}
	else
	{
	condition = false;
	}

	
	
//adds a user to the afk list when they join the stage.
if(AFK == true && condition == false);
{
currentDjs.push(data.user[0].userid);
}


//tells a dj trying to get on stage how to add themselves to the queuelist
var ifUser2 = queueList.indexOf(data.user[0].userid);	
if(queue == true && ifUser2 == -1)
{
bot.pm('The queue is currently active. To add yourself to the queue type /addme. To remove yourself from the queue type /removeme.', data.user[0].userid);
}
	


//removes a user from the queue list when they join the stage.
if(queue == true)
{
var ifUser = queueList.indexOf(data.user[0].userid);
var firstOnly = queueList.indexOf(data.user[0].userid);

  if(queueList[firstOnly] != queueList[1] || ifUser == -1 && data.user[0].userid != USERID)
  {
  bot.remDj(data.user[0].userid);
  }}
if(queue == true)
{
var checkQueue = queueList.indexOf(data.user[0].name);
var checkName2 = queueName.indexOf(data.user[0].name);
console.log('DEBUGGING: ', checkQueue);
if(checkQueue != -1 && checkQueue == 0)
{
queueList.splice(checkQueue, 2);
queueName.splice(checkName2, 1);
console.log('DEBUGGING: ', queueList, queueName);
}}
 })

 
 
 
 
//checks when the bot recieves a pm
 bot.on('pmmed', function (data) {
 var text = data.text;
  if (text.match(/^\/chilly$/)) {
    bot.speak('@'+name+' is pleasantly chilled.');
  }
  else if (text.match(/^\/m/)) {
    bot.speak(text.substring(3));	
  }  
  else if(text.match(/^\/commands/))
  {
   bot.pm('the commands are  /awesome, ' +
             ' /mom, /chilly, /hello, /escortme, /stopescortme, /fanme, /unfanme, /roominfo, /beer, /dice, /props, /m, /getTags, /admincommands, /queuecommands', data.senderid);
  }  
 });
 
 



//starts up when bot first enters the room
bot.on('roomChanged', function (data) {

//finds out who the currently playing dj's are.
currentDjs = data.room.metadata.djs;


//initializes currently playing dj's song count to zero.
var currentPlayers = data.room.metadata.djs;
for (var i = 0; i < currentPlayers.length; i++) {
    djs20[currentPlayers[i]] = { nbSong: 0 };
  }

  
//list of escorts, users, and moderators is reset    
escortList = [];
theUsersList = [];
modList = [];  


	
//set modlist to list of moderators
modList = data.room.metadata.moderator_id;	
	
  
  
  
//used to get room description
detail = data.room.description;



//used to get user names and user id's
  var users = data.users;
  for (var i=0; i<users.length; i++) {
    var user = users[i];
	user.lastActivity = user.loggedIn = new Date();
    theUsersList.push(user.userid, user.name);
	
  }
});






//starts up when a new person joins the room
bot.on('registered', function (data) {


//gets newest user and prints greeting
var roomjoin = data.user[0];
if (GREET == true)
{
bot.speak('Welcome to ' + roomName + ' @' + roomjoin.name + ' enjoy your stay!');
}
     
   
   
//adds users who join the room to the user list if their not already on the list
var checkList = theUsersList.indexOf(data.user[0].userid);
   if(checkList == -1)
     {
     theUsersList.push(data.user[0].userid, data.user[0].name);
     }
	 
	 
	 
//checks to see if user is on the banlist, if they are they are booted from the room.
   for (var i=0; i<blackList.length; i++) {
    if (roomjoin.userid == blackList[i]) {
      bot.bootUser(roomjoin.userid, 'You are on the banlist.');
      break;
    }
  }
});






//updates the moderator list when a moderator is removed.
bot.on('rem_moderator', function (data) { 
var test51 = modList.indexOf(data.userid);
modList.splice(test51, 1);
console.log('DEBUGGING: ',modList);
})





//updates the moderator list when a moderator is added.
bot.on('new_moderator', function (data) {
var test50 = modList.indexOf(data.userid);
if(test50 == -1)
{
modList.push(data.userid);
console.log('DEBUGGING: ',modList);
}
})






 //starts up when a user leaves the room
bot.on('deregistered', function (data) {

//updates the users list when a user leaves the room.
var user = data.user[0].userid;
var checkLeave = theUsersList.indexOf(data.user[0].userid);
    if (checkLeave != -1){
	theUsersList.splice(checkLeave, 2);
	}	
	
/*
var queueLeave = data.user[0].name;
var leaveCheck = queueList.indexOf(queueLeave);         //uncomment this section of code to have the bot remove people that leave the room from the queue list.
var leaveName = queueName.indexOf(queueLeave);
if(leaveCheck != -1);
	{
	queueList.splice(leaveCheck, 2);
	queueName.splice(leaveName, 1);
	}	
*/
 })




//activates at the end of a song.
bot.on('endsong', function(data) { 
  
  //procedure for getting song tags
    song = data.room.metadata.current_song.metadata.song;
    album = data.room.metadata.current_song.metadata.album; 
	genre = data.room.metadata.current_song.metadata.genre;
        
	
	//iterates through the dj list incrementing dj song counts and
	//removing them if they are over the limit.
	
	var djId = data.room.metadata.current_dj;
    if (djs20[djId] && ++djs20[djId].nbSong >= playLimit) {
    var checklist33 = theUsersList.indexOf(djId) + 1;
	var checklist34 = modList.indexOf(djId);
	if(checklist34 == -1 && queue == true && djId != USERID)
	{
	bot.speak('@' + theUsersList[checklist33] + ' you are over the playlimit of ' + playLimit + ' songs'); 
    bot.remDj(djId);
	}
    delete djs20[djId];
    }
	
		
     //iterates through the escort list and escorts all djs on the list off the stage.
	  for (var i = 0; i<escortList.length; i++){
	  if(data.room.metadata.current_dj == escortList[i]){
	  bot.remDj(escortList[i]);
	  var removeFromList = escortList.indexOf(escortList[i]);
	  escortList.splice(removeFromList, 1);
	  }}
 
});
 
