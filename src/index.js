const express = require('express');
const app = express();

app.use(express.json());

const { uuid } = require('uuidv4') //npm install uuidv4
const projects = [];
var numRoutes = 0;

//Criação de Middleware
function logRoutes(request, response, next) {
    const { method, url } = request;

    const route = `[${method.toUpperCase()}] ${url}`;

    console.log(route);

    return next();
}
//Determinando uso do middleware em todas as requisições 
app.use(logRoutes);

function countCreate(request, response, next) {
    console.log(`Create Calls: ${++numRoutes}`);
    return next();
}
function justAnotherMiddleware(request, response, next) {
    console.log(`Nothing done here`);
    return next();
}

app.get('/projects', justAnotherMiddleware, (request, response) => {
    const { title } = request.query;

    //Filtro por title
    const results = title 
        ? projects.filter(project => project.title.includes(title))
        : projects

    return response.json(results);
})

app.post('/projects', countCreate, justAnotherMiddleware, (request, response) => {
    const { title, owner } = request.body;
    const id = uuid();
    const project = {
        id,
        title,
        owner
    };
    projects.push(project);
    return response.json(project);
})

app.put('/projects/:id', (request, response) => {
    const { id } = request.params;
    const { title, owner } = request.body;
    
    const projectIndex = projects.findIndex(project => project.id === id);

    if (projectIndex < 0) {
        return response.status(400).json({error: 'Project not found!'});
    }

    const project = {
        id,
        title: title===undefined ? projects[projectIndex].title : title,
        owner: owner===undefined ? projects[projectIndex].owner : owner
    };
    projects[projectIndex] = project;

    return response.json(project);
})

app.delete('/projects/:id', (request, response) => {
    const { id } = request.params;
    
    const projectIndex = projects.findIndex(project => project.id === id);

    if (projectIndex < 0) {
        return response.status(400).json({error: `Cannot DELETE Project ${id}! `+`Project not found`});
    }

    projects.splice(projectIndex, 1);

    return response.status(204).json([]);
})

app.listen(3333, () => {
    console.log('Server up!')
});