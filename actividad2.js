const axios=require('axios');

//Secuencial
async function obtenerUsuarios(){
    let usuarios=[];
    try{
        for(let i=1; i<4;i++){
            let response=await axios.get(`https://jsonplaceholder.typicode.com/users/${i}`);
            let datos=response.data;
            usuarios.push({
                id: datos.id,
                name: datos.name
            });
            
        }
        return usuarios;
    }
    catch(error){
        console.error('Error al obtener al usuario: ',error);
        return [];
    }
};

async function obtenerPublicaciones(usuarios){
    let publicaciones=[];
    try{
        for(let i=0;i<usuarios.length;i++){
            let response=await axios.get(`https://jsonplaceholder.typicode.com/posts?userId=${usuarios[i].id}`);
            publicaciones.push(response.data);
        }
        return publicaciones;
    }
    catch(error){
        console.error(`Error al obtener publicaciones: `,error);
        return [];
    }
};

async function mainSecuencial(){
    //Main//
    try{
        const inicio=Date.now();
        const usuarios=await obtenerUsuarios();
        const publicaciones=await obtenerPublicaciones(usuarios);
    
        if(usuarios.length>=3 && publicaciones.length>=3){
            console.log(`${usuarios[0].name} tiene ${publicaciones[0].length} publicaciones`);
            console.log(`${usuarios[1].name} tiene ${publicaciones[1].length} publicaciones`);
            console.log(`${usuarios[2].name} tiene ${publicaciones[2].length} publicaciones`);
            console.log(`Tiempo de ejecucion sincronico ${Date.now()-inicio}ms`);
        } else {
            console.log('No se pudieron obtener todos los valores secuencialmente');
            console.log(`Se obtubieron ${usuarios.length} usuarios y ${publicaciones.length} publicaciones`);
        }
    }
    catch(error){
        console.error("Error en secuencial :(");
    }
}


//Concurrencia
async function obtenerUsuariosConcurrencia(){
    try{
        const promesas=[
            axios.get(`https://jsonplaceholder.typicode.com/users/1`),
            axios.get(`https://jsonplaceholder.typicode.com/users/2`),
            axios.get(`https://jsonplaceholder.typicode.com/users/3`)]

        let [datos1,datos2,datos3]=await Promise.all(promesas);
        return [datos1.data,datos2.data,datos3.data];
    }
    catch(error){
        console.error('Error al obtener al usuario: ',error);
        return [];
    }
};

async function obtenerPublicacionesConcurrencia(){
    try{
        const promesas=[
            axios.get(`https://jsonplaceholder.typicode.com/posts?userId=1`),
            axios.get(`https://jsonplaceholder.typicode.com/posts?userId=2`),
            axios.get(`https://jsonplaceholder.typicode.com/posts?userId=3`)]
            let [datos1,datos2,datos3]=await Promise.all(promesas);
        return [datos1.data,datos2.data,datos3.data];
    }
    catch(error){
        console.error(`Error al obtener publicaciones: `,error);
        return [];
    }
};

async function mainConcurrente() {
    try{
    const inicio=Date.now();
    const response=await Promise.all([obtenerUsuariosConcurrencia(),obtenerPublicacionesConcurrencia()])
    const usuarios=response[0];
    const publicaciones=response[1];
     if(usuarios.length>=3 && publicaciones.length>=3){
            console.log(`${usuarios[0].name} tiene ${publicaciones[0].length} publicaciones`);
            console.log(`${usuarios[1].name} tiene ${publicaciones[1].length} publicaciones`);
            console.log(`${usuarios[2].name} tiene ${publicaciones[2].length} publicaciones`);
            console.log(`Tiempo de ejecucion concurrente ${Date.now()-inicio}ms`);
        } else {
            console.log('No se pudieron obtener todos los valores concurrentemente');
            console.log(`Se obtubieron ${usuarios.length} usuarios y ${publicaciones.length} publicaciones`);
        }
    }
    catch(error){
        console.error(`Error en concurrencia `,error);
    }
}

mainSecuencial();
mainConcurrente();