const { request, response } = require("express");
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

function getBalance(statement){
    const balance = statement.reduce((acc, operation)=> {
        if(operation.type === 'credit'){
            return acc + operation.amount;
        }else{
            return acc - operation.amount;
        }
    }, 0)

    return balance;
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

app.post("/deposit", verifyIfExistsAccountCPF, (request, response)=>{
    const{description, amount} = request.body;

    const {customer} = request;

    const statementOperation ={
        description,
        amount,
        created_at:new Date(),
        type: "credit"
    }

    customer.statement.push(statementOperation);

    return response.status(201).send();
})

app.post("/withdraw", verifyIfExistsAccountCPF, (request, response)=> {
    const {amount} = request.body;
    const {customer} = request;

    const balance = getBalance(customer.statement);

    if(balance < amount){
        return response.status(400).json({error:"Insufficient funds!"});
    }

        const statementOperation ={
            amount,
            created_at: new Date(),
            type: "debit",
        };

        customer.statement.push(statementOperation);

        return response.status(201).send();
})

app.listen(3333);