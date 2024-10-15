//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

enum ContractStatus{
    Draft, //proposicion del dueño al posible cliente
    DraftReview, //proposicion del cliente al dueño
    Active, //contrato activo
    Breach, 
    CancelationProposedByOwner,
    CancelationPropopsedByLeassee,
    Cancelled
}