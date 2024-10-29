const asyncHandler = require('express-async-handler');
const db = require("../db/pool")
const { validationResult } = require('express-validator');

exports.createBoard = asyncHandler(async (req, res) => {
    const { name, columns, userId } = req.body;

    //  Validate the request
    if (!name || !columns || !userId) {
        res.status(400).json({ message: 'Please provide all the required fields' });
    }

    //  Create the board
    const newBoard = await db.query('INSERT INTO boards (name, user_id) VALUES($1, $2) RETURNING *', [name, userId]);

    //  Create the columns
    columns.forEach(async (column) => {
        await db.query('INSERT INTO columns (name, board_id) VALUES($1, $2)', [column.name, newBoard.rows[0].id]);
    })

    //  Merge the board and columns into a single object
    const board = {
        id: newBoard.rows[0].id,
        name: newBoard.rows[0].name,
        columns: columns
    }

    //  Send the response
    res.status(201).json({ 
        message: 'Board created successfully', 
        board: board
    });
    
})

exports.getBoardsLegacy = asyncHandler(async (req, res) => {
    const userId = req.params.userId;

    const sqlQuery = `
        SELECT 
            b.id AS board_id,
            b.name AS board_name,
            c.id AS column_id,
            c.name AS column_name,
            t.id AS task_id,
            t.name AS task_name,
            t.description AS task_description,
            t.due_date AS task_due_date,
            t.status AS task_status,
            s.id AS subtask_id,
            s.name AS subtask_name,
            s.completed AS subtask_completed
        FROM 
            boards b
        LEFT JOIN 
            columns c ON b.id = c.board_id
        LEFT JOIN 
            tasks t ON c.id = t.column_id
        LEFT JOIN 
            subtasks s ON t.id = s.task_id
        WHERE 
            b.user_id = $1;  -- Use $1 instead of ?
    `;

    // Query the database
    const rows = await db.query(sqlQuery, [userId]);

    // Structure data into the required format
    const boardsMap = {};

    rows.rows.forEach(row => {
        // Destructure row for ease of use
        const {
            board_id, board_name, column_id, column_name,
            task_id, task_name, task_description, task_due_date, task_status,
            subtask_id, subtask_name, subtask_completed
        } = row;

        // Initialize the board if it doesn't exist
        if (!boardsMap[board_id]) {
            boardsMap[board_id] = {
                id: board_id,
                name: board_name,
                columns: []
            };
        }

        // Find or create the column within the board
        let column = boardsMap[board_id].columns.find(c => c.id === column_id);
        if (!column) {
            column = {
                id: column_id,
                name: column_name,
                tasks: []
            };
            boardsMap[board_id].columns.push(column);
        }

        // Find or create the task within the column
        let task = column.tasks.find(t => t.id === task_id);
        if (task) {
            task = {
                id: task_id,
                name: task_name,
                description: task_description,
                dueDate: task_due_date,
                status: task_status,
                subtasks: []
            };
            column.tasks.push(task);
        }

        // Add the subtask if it exists
        if (subtask_id) {
            task.subtasks.push({
                id: subtask_id,
                name: subtask_name,
                completed: subtask_completed
            });
        }
    });

    // Convert boardsMap to an array
    const boards = Object.values(boardsMap);

    console.log("Here are the boards: ", boards);

    // Send the structured response
    return res.status(200).json({ boards });
});


exports.getUserBoards = asyncHandler(async (req, res) => {
    const userId  = req.params.userId;

    //  Query the database for the boards
    const userBoards = await db.query('SELECT * FROM boards WHERE user_id = $1', [userId]);

    var userColumns = []

    userBoards.rows.forEach(async (board) => {
        var columns = await db.query('SELECT * FROM columns WHERE board_id = $1', [board.id])
    })


})