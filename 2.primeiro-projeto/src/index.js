const { request } = require("express");
const express = require("express");
const { v4: uuidv4} = require ("uuid")

const app = express();

app.use(express.json());

const customers =[];

function verifyIfExistsAccountCPF(request, response, next){
    const {cpf} = request.headers;

    const customer = customers.find((customer)=> customer.cpf ===cpf);

    if(!customer){
        return response.status(400).json({error:"Customer not found"});
    }
    
    request.customer = customer; //para usar o customer nas rotas foi pego ele do request

    return next();
}

app.post("/account", (request, response)=>{
    const {cpf, name} = request.body;

    const customerAlreadyExists = customers.some((customer)=> customer.cpf === cpf);

    if (customerAlreadyExists){
        return response.status(400).json({error: "customer already exists"} )
    }

    customers.push({
        cpf,
        name,
        id: uuidv4(), // para não precisar chamar fora
        statement:[],
    });

    return response.status(201).send();
})

app.get("/statement", verifyIfExistsAccountCPF, (request, response)=> {
    const {customer} = request; //desestruturado para usar o customer

    return response.json(customer.statement);

});


app.listen(3333);