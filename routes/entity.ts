import express from "express";

export = (() => {

    let router = express.Router();

    router.get('/entity', (req, res) => {
        res.json({ success: true });
    });

    return router;
})();