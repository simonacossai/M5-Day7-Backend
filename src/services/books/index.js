const express = require("express")
const uniqid = require("uniqid")
const { getBooks, writeBooks } = require("../../fsUtilities")

const booksRouter = express.Router()

booksRouter.get("/", async (req, res, next) => {
  try {
    const books = await getBooks()

    if (req.query && req.query.category) {
      const filteredBooks = books.filter(
        book =>
          book.hasOwnProperty("category") &&
          book.category === req.query.category
      )
      res.send(filteredBooks)
    } else {
      res.send(books)
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
})

booksRouter.get("/:asin", async (req, res, next) => {
  try {
    const books = await getBooks()

    const bookFound = books.find(book => book.asin === req.params.asin)

    if (bookFound) {
      res.send(bookFound)
    } else {
      const err = new Error()
      err.httpStatusCode = 404
      next(err)
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
})

booksRouter.post("/", async (req, res, next) => {
  try {
   
      const books = await getBooks()
      const asinFound = books.find(book => book.asin === req.body.asin)

      if (asinFound) {
        const error = new Error()
        error.httpStatusCode = 400
        error.message = "Book already in db"
        next(error)
      } else {
        newBook={
            ...req.body,
            comments:[],
        }
        books.push(newBook)
        await writeBooks(books)
        res.status(201).send({ asin: req.body.asin })
    }
  } catch (error) {
    console.log(error)
    const err = new Error("An error occurred while reading from the file")
    next(err)
  }
})

booksRouter.put("/:asin", async (req, res, next) => {
  try {
    const books = await getBooks()

    const bookIndex = books.findIndex(book => book.asin === req.params.asin)

    if (bookIndex !== -1) {
      // book found
      const updatedBooks = [
        ...books.slice(0, bookIndex),
        { ...books[bookIndex], ...req.body },
        ...books.slice(bookIndex + 1),
      ]
      await writeBooks(updatedBooks)
      res.send(updatedBooks)
    } else {
      const err = new Error()
      err.httpStatusCode = 404
      next(err)
    }
  } catch (error) {
    console.log(error)
    const err = new Error("An error occurred while reading from the file")
    next(err)
  }
})

booksRouter.delete("/:asin", async (req, res, next) => {
  try {
    const books = await getBooks()

    const bookFound = books.find(book => book.asin === req.params.asin)

    if (bookFound) {
      const filteredBooks = books.filter(book => book.asin !== req.params.asin)

      await writeBooks(filteredBooks)
      res.status(204).send()
    } else {
      const error = new Error()
      error.httpStatusCode = 404
      next(error)
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
})

booksRouter.get("/:asin/comments", async (req, res, next) => {
    try {
     const books = await getBooks()
  
      const bookFound = books.find(
        book => book.asin === req.params.asin
      )
  
      if (bookFound) {
        res.send(bookFound.comments)
      } else {
        const error = new Error()
        error.httpStatusCode = 404
        next(error)
      }
    } catch (error) {
      console.log(error)
      next(error)
    }
  })
  
  booksRouter.get("/:asin/comments/:commentID", async (req, res, next) => {
    try {
    const books = await getBooks()
  
      const bookFound = books.find(
        book => book.asin === req.params.asin
      )
  
      if (bookFound) {
        const commentFound = bookFound.comments.find(
          comment => comment.commentID === req.params.commentID
        )
        if (commentFound) {
          res.send(commentFound)
        } else {
          const error = new Error()
          error.httpStatusCode = 404
          next(error)
        }
      } else {
        const error = new Error()
        error.httpStatusCode = 404
        next(error)
      }
    } catch (error) {
      console.log(error)
      next(error)
    }
  })
  
  booksRouter.post(
    "/:asin/comments",
    async (req, res, next) => {
      try {
        const books = await getBooks()
  
        const bookIndex = books.findIndex(
          book => book.asin === req.params.asin
        )
        if (bookIndex !== -1) {
          books[bookIndex].comments.push({
            ...req.body,
            commentID: uniqid(),
            createdAt: new Date(),
          })
          await writeBooks(books)
          res.status(201).send(books)
        } else {
          const error = new Error()
          error.httpStatusCode = 404
          next(error)
        }
      } catch (error) {
        console.log(error)
        next(error)
      }
    }
  )
  
  booksRouter.put(
    "/:asin/comments/:commentID",
    async (req, res, next) => {
      try {
        const books = await getBooks()
  
        const bookIndex = books.findIndex(
          book => book.asin === req.params.asin
        )
  
        if (bookIndex !== -1) {
          const commentIndex = books[bookIndex].comments.findIndex(
            comment => comment._commentID === req.params.commentID
          )
  
          if (commentIndex !== -1) {
            const previousComment = books[bookIndex].comments[commentIndex]
  
            const updateComments = [
              ...books[bookIndex].comments.slice(0, commentIndex), 
              { ...previousComment, ...req.body, updatedAt: new Date() }, 
              ...books[bookIndex].comments.slice(commentIndex + 1),
            ] 
            books[bookIndex].comments = updateComments
  
            await writeBooks(books)
            res.send(books)
          } else {
            console.log("Comment not found")
          }
        } else {
          console.log("BOOK not found")
        }
      } catch (error) {
        console.log(error)
        next(error)
      }
    }
  )
  
  booksRouter.delete(
    "/:asin/comments/:commentID",
    async (req, res, next) => {
      try {
        const books = await getBooks()
  
        const bookIndex = books.findIndex(
          book => book.asin === req.params.asin
        )
  
        if (bookIndex !== -1) {
          books[bookIndex].comments = books[bookIndex].comments.filter(
            comment => comment.commentID !== req.params.commentID
          )
  
          await writeBooks(books)
          res.send(books)
        } else {
        }
      } catch (error) {
        console.log(error)
        next(error)
      }
    }
  )
  
module.exports = booksRouter


