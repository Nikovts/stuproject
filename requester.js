"use strict";
const userNameandPass = btoa("Nikolay:niko");
const baseUrl = 'https://baas.kinvey.com';
const appKey = 'kid_ByiqSiCsr';
const appSecret = 'af71380e2e9a4ef78ad259105f08fb51';

function createAuthorization(type) {
    return type=== 'Basic'
    ?  `Basic ${btoa(`${appKey}:${appSecret}`)}`
    :  `Kinvey ${sessionStorage.getItem('authtoken')}`;
}

function makeHeaders(type,httpMethod, data){
    const headers = {
        method: httpMethod,
        headers: {
            'Authorization': createAuthorization(type),
            'Content-type' : 'application/json'
        }
    }
    if(httpMethod==='POST'||httpMethod==='PUT'){
        headers.body=JSON.stringify(data);
    }
    return headers
}

function handleError(e) {
    if (!e.ok) {
     throw new Error(e.statusText);  
    }
    return e
}
// function logoutFromKinvey(x){
//     if (x.status===204) {
//       return x  
//     }
//     return x.json();
// }

function baseFetch(kinveyModule,endUrl,headers) {
    const url = `${baseUrl}/${kinveyModule}/${appKey}/${endUrl}`;

    return fetch(url,headers)
    .then(handleError)
    .then((res)=>{
       if (res.status== 204){
           return res
       }
      return res.json()
    });
    
}

export function get(kinveyModule,endUrl,type) {
    const headers=makeHeaders(type,'GET');
    
    return baseFetch(kinveyModule,endUrl,headers);
}

export function post(kinveyModule,endUrl,data,type) {
    const headers=makeHeaders(type,'POST',data);
    
    return baseFetch(kinveyModule,endUrl,headers);
}

export function put(kinveyModule,endUrl,data,type) {
    const headers=makeHeaders(type,'PUT', data);
    
    return baseFetch(kinveyModule,endUrl,headers);
}

export function del(kinveyModule,endUrl,type) {
    const headers=makeHeaders(type,'DELETE');
    
    return baseFetch(kinveyModule,endUrl,headers);
}