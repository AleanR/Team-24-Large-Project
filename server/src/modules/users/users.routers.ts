import { Router } from 'express';
import { deleteUser, getAllUsers, getCurrentUser, searchUsers, updateUser } from './users.controllers';
import { isAuthenticated } from '../../middlewares';
import { forgotPass, resetPass } from './users.password';

export default (router: Router) => {
    router.get('/users/me', isAuthenticated, getCurrentUser);
    router.get('/users', isAuthenticated, getAllUsers);
    router.delete('/users/:id', isAuthenticated, deleteUser);
    router.patch('/users/:id', isAuthenticated, updateUser);
    router.post('/users/forgot-password', forgotPass);
    router.patch('/users/reset-password/:token', resetPass);
    router.get('/users/search', isAuthenticated, searchUsers);
}
