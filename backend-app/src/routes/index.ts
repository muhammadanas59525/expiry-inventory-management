import { Router } from 'express';
import { IndexController } from '../controllers/index';

const router = Router();
const indexController = new IndexController();

export function setRoutes(app: any) {
    app.use('/api/items', router);
    router.get('/', indexController.getAllItems.bind(indexController));
    router.post('/', indexController.createItem.bind(indexController));
}