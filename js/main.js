{

/* ========================
  Variables
======================== */

 const FIREBASE_AUTH = firebase.auth();
 const FIREBASE_MESSAGING = firebase.messaging();
 const FIREBASE_DATABASE = firebase.database();

    const signInButton = document.getElementById('sign-in');
    const signOutButton = document.getElementById('sign-out');
    const subscribeButton = document.getElementById('Subscribe');
    const unsubscribeButton = document.getElementById('Unsubscribe');
    const sendNotificationForm = document.getElementById('send-notification-form');
/* ========================
  Event Listeners
======================== */
    signInButton.addEventListener('click',signIn);
    signOutButton.addEventListener('click',signOut);
    FIREBASE_AUTH.onAuthStateChanged(handleAuthStateChanged);
    subscribeButton.addEventListener('click',subscribeToNotifications);
    unsubscribeButton.addEventListener('click',unsubscribefromNotifications);
    FIREBASE_MESSAGING.onTokenRefresh(handleTokenRefresh);
    sendNotificationForm.addEventListener("submit", sendNotification);

/* ========================
  Functions
======================== */
     function signIn(){
     FIREBASE_AUTH.signInWithPopup(new firebase.auth.GoogleAuthProvider());
      }   
     function signOut(){
        FIREBASE_AUTH.signOut();
      }
 
    function handleAuthStateChanged(user){
        if(user){
       console.log(user);
            signInButton.setAttribute("hidden","true");
            signOutButton.removeAttribute("hidden");
            
            checkSubscription();
    }
        else{
            console.log("no user");
            signOutButton.setAttribute("hidden","true");
            signInButton.removeAttribute("hidden");
            
        }
    }
    
    function subscribeToNotifications(){
        FIREBASE_MESSAGING.requestPermission()
        .then(()=> handleTokenRefresh())
        .then(() => checkSubscription())
         .catch((err) =>{
            console.log("user did't give permission");
        });
        
    }
    
    function handleTokenRefresh(){
        return FIREBASE_MESSAGING.getToken()
        .then((token) => {
             FIREBASE_DATABASE.ref('/tokens').push({
            token:token,
            uid : FIREBASE_AUTH.currentUser.uid,
            name:FIREBASE_AUTH.currentUser.displayName
            
        });
                                            
        
        });
    }
    
    function unsubscribefromNotifications(){
        FIREBASE_MESSAGING.getToken()
        .then((token)=> FIREBASE_MESSAGING.deleteToken(token))
        .then(() => FIREBASE_DATABASE.ref('/tokens').orderByChild('uid').equalTo(FIREBASE_AUTH.currentUser.uid).once('value'))
        .then((snapshot)=> { 
            console.log(snapshot.val());
           const key = Object.keys(snapshot.val())[0];
            return FIREBASE_DATABASE.ref('/tokens').child(key).remove();
        })
         .then(() => checkSubscription())
        .catch((err) =>{
            console.log("unsubscription failed");
        });
    }
    
    
         function checkSubscription() {
   FIREBASE_DATABASE.ref('/tokens').orderByChild("uid").equalTo(FIREBASE_AUTH.currentUser.uid).once('value').then((snapshot) => {
    if ( snapshot.val() ) {
      subscribeButton.setAttribute("hidden", "true");
      unsubscribeButton.removeAttribute("hidden");
    } else {
      unsubscribeButton.setAttribute("hidden", "true");
      subscribeButton.removeAttribute("hidden");
    }
  });
 }
    
        function sendNotification(e){
         e.preventDefault();
            const notificationMessage = document.getElementById('notification-message').value;
             FIREBASE_DATABASE.ref('/notifications').push({
             user:FIREBASE_AUTH.currentUser.displayName,
              message: notificationMessage,
             userprofileimg: FIREBASE_AUTH.currentUser.photoURL
            })
            .then(()=> {
             document.getElementById('notification-message').value=" ";
            })
            .catch(()=> {
                console.log("error sending message : ")
            });      
        }
    
    
    
}