import { type Request, type Response, Router } from 'express';
import bodyParser from 'body-parser';

const books = Router();

books.use(bodyParser.json());

// Index route
books.get('/', async (req: Request, res: Response) => {
  // TODO implement get all books
  try {
    res.send('TODO implement index route');
  } catch (error) {
    res.status(400);
    res.json(error);
  }
});

// Show route
books.get('/:id', async (req: Request, res: Response) => {
  // TODO implement get book by ID
  console.log(`Get book with id: ${req.params.id}`);
  try {
    res.send('TODO implement show route');
  } catch (error) {
    res.status(400);
    res.json(error);
  }
});

// Create route
books.post('/', async (req: Request, res: Response) => {
  // TODO implement create a new book
  // example: const { name } = req.body;
  console.log('Create book request body:', req.body);
  try {
    res.send('TODO implement create route');
  } catch (error) {
    res.status(400);
    res.json(error);
  }
});

// Edit route
books.put('/:id', async (req: Request, res: Response) => {
  // TODO implement update a book by id
  console.log(`Update book with id: ${req.params.id}`);
  console.log(`Request body - updates to make:`, req.body);
  try {
    res.send('TODO implement edit route');
  } catch (error) {
    res.status(400);
    res.json(error);
  }
});

// Delete route
books.delete('/:id', async (req: Request, res: Response) => {
  // TODO delete a book by id
  console.log(`Book id to delete: ${req.params.id}`);
  try {
    res.send('TODO implement delete route');
  } catch (error) {
    res.status(400);
    res.json(error);
  }
});

export default books;
