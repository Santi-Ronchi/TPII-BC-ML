'use client';
import type { NextPage } from "next";
import React from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from "./firebase";
import { useState } from 'react';
import { useUser } from "../user/UserContext";
import Servicios from "./Servicios";


const ServiciosPage: NextPage = () => {
  return (
    <><div>
      <Servicios propiedadId={"1"}></Servicios>
    </div></>
    );
  };

export default ServiciosPage;