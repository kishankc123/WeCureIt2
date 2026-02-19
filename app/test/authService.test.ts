import LoginPage from "../general/login/page";
import {prisma}  from "../../lib/prisma";
import {handler} from '../api/auth/[...nextauth]/route';
import { it } from "node:test";

jest.mock('../db')
jest.mock('../utils/auth');


describe('Login Feature',()=>{
    it("Should login with correct email and password",async()=>{
        const mockUser = { email: 'example@email.com', password: 'HASHED_PASSWORD' };
       
        // Mock DB to return a user
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

        //Mock passowrd verification to return true
        (handler as jest.Mock).mockResolvedValue(true);

        const result = await LoginPage('example@gmail.com','HASEHED_PASSWORD');
        expect(result).toEqual(mockUser);
        expect(prisma.user.findUnique).toHaveBeenCalledWith({where:{email:'example@gmail.com'}});
        expect(handler).toHaveBeenCalledWith('HASEHED_PASSWORD','HASHED_PASSWORD');
    });  })
