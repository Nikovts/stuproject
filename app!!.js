import {get,post,put,del} from './requester.js';
const app=Sammy('#router',function () {
    this.use("Handlebars",'hbs');

    function getPartials(){
        return{
            header:'./views/common/header.hbs',
            footer:'./views/common/footer.hbs'
        }
    }
    function displayError(message) {
        const errorBox=document.getElementById("errorBox");
        errorBox.style.display='block';
        errorBox.textContent=message;
        setTimeout(()=>{
        errorBox.style.display='none'},
        2000)
    } 
    function displaySuccess(message) {
        const successBox=document.getElementById("successBox");
        successBox.style.display='block';
        successBox.textContent=message;
        setTimeout(()=>{
        successBox.style.display='none'},
        6000)
        //go((ctx)=>{ctx.redirect('/')})
    } 
    function setInfo(ctx) {
        ctx.isLOgin=sessionStorage.getItem('authtoken')!==null;
        ctx.username=sessionStorage.getItem('username');
    }
    function saveAuthtoken(userinfo){
        sessionStorage.setItem('authtoken',userinfo._kmd.authtoken);
        sessionStorage.setItem('username',userinfo.username);
        sessionStorage.setItem('userId', userinfo._id);
    }
    this.get('/',function(ctx) {
        setInfo(ctx)
        this.loadPartials(getPartials())
        .partial('./views/start.hbs') 
    });
    this.get('#/register',function(ctx) {
        setInfo(ctx)
        this.loadPartials(getPartials())
        .partial('./views/register/sign-up.hbs') 
    });
    this.post('#/register',function(ctx) {
        const{username,password,rePassword}=ctx.params;
        if(username&&password===rePassword){
            post('user','',{username,password},'Basic')
            .then((userdata)=>{
                saveAuthtoken(userdata);
                displaySuccess("Successfully registered user.");
                setTimeout(()=>{
                    ctx.redirect('#/home')},
                    4000)
            })
            .catch((err)=>displayError(err)
            )
        }
        else {
            displayError('Wrong input')
        }
    });
    this.get('#/logout',function(ctx) {
        post('user','_logout',{},'Kinvey')
        .then(()=>{
            sessionStorage.clear();
            displaySuccess("Logout successful.")
            setTimeout(()=>{
                ctx.redirect('/')},
                4000)
        })
        .catch(console.error)
   });
   this.get('#/login',function(ctx) {
    setInfo(ctx)
    this.loadPartials(getPartials())
    .partial('./views/register/login.hbs') 
    });
    this.post('#/login',function(ctx) {
        const{username,password}=ctx.params;
        if(username&&password){
            post('user','login',{username,password},'Basic')
            .then((userdata)=>{
                displaySuccess("Successfully logged user.")
                saveAuthtoken(userdata)
                setTimeout(()=>{
                    ctx.redirect('#/home')},
                    4000)
                })
            .catch((err)=>displayError('Invalid credential! Please retry your request with correct credentials.'))
        }
    });
    this.get('#/home',function(ctx) {
        setInfo(ctx)
        get('appdata','treks','Kinvey')
        .then((trecs)=>{
            if (trecs.length>0){
            ctx.isTrecs=true;
            ctx.trecs=trecs;}
            this.loadPartials(getPartials())
            .partial('./views/home.hbs') ;
        })
       .catch((err)=>displayError(err))
    });
    this.get('#/create',function(ctx) {
        setInfo(ctx);
        this.loadPartials(getPartials())
        .partial('./views/create.hbs')
        });
    this.post('#/create',function(ctx) {
            const{location,dateTime,description,imageURL}=ctx.params;
           if(location && dateTime &&  description && imageURL){
                post('appdata','treks',{location,dateTime,description,imageURL,
                    "likes":0,
                  "organizer": sessionStorage.getItem('username')
                },'Kinvey')
                .then(()=>{
                  displaySuccess("Trek created successfully.");
                  setTimeout(()=>{
                    ctx.redirect('#/home')},
                    4000)
                })
                .catch(console.error)
            }
    });
    this.get('#/details/:id',function(ctx) {
        setInfo(ctx);
        const id=ctx.params.id;
        get('appdata',`treks/${id}`,'Kinvey')
        .then(treks=>{
            treks.isCreator=sessionStorage.getItem('userId')===treks._acl.creator;
            ctx.treks=treks;
            this.loadPartials(getPartials())
            .partial('../views/details.hbs')
        })
        .catch(console.error)
    });
    this.get('#/edit/:id',function(ctx) {
        setInfo(ctx);
        const id=ctx.params.id;
        get('appdata',`treks/${id}`,'Kinvey')
        .then((treks)=>{
            ctx.treks=treks;
            this.loadPartials(getPartials())
            .partial('./views/edit.hbs')
        })
        .catch(console.error)
    });
    this.post('#/edit/:id',function(ctx) {
        setInfo(ctx);
        const id=ctx.params.id;
        const{location,dateTime,description,imageURL,organizer,likes}=ctx.params; 
       if(location && dateTime &&  description && imageURL){
            put('appdata',`treks/${id}`,{location,dateTime,description,imageURL,organizer,likes},'Kinvey') 
             .then(()=>{
              displaySuccess("Trek edited successfully.");
              setTimeout(()=>{
                ctx.redirect('#/home')},
                2000)
            })
            .catch(console.error)
        }
      });
      this.get('#/close/:id',function(ctx) {
        setInfo(ctx);
        const id=ctx.params.id;
        del('appdata',`treks/${id}`,'Kinvey')
        .then(()=>{
            displaySuccess("You closed the trek successfully." )
            setTimeout(()=>{
                ctx.redirect('#/home')},
                2000)
            
        })
        .catch(console.error)
        });
     this.get('#/like/:id',function(ctx) {
            setInfo(ctx);
            const id=ctx.params.id;
            get('appdata',`treks/${id}`,'Kinvey')
            .then((treks)=>{
                ctx.treks=treks;
                this.loadPartials(getPartials())
            .partial('./views/like.hbs')
            const{location,dateTime,description,imageURL,organizer,likes}=ctx.treks;
            let num=likes+1;
            put('appdata',`treks/${id}`,{location,dateTime,description,imageURL,organizer,likes:num},'Kinvey')
            .then(()=>{
                displaySuccess("You liked the trek successfully.");
                setTimeout(()=>{
                    ctx.redirect('#/home')},
                    2000)
            })
            .catch(console.error)
       
            })
            .catch(console.error)
        });   
})
app.run()
