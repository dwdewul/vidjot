module.exports = {
    requireLogin(req, res, next){
        if(req.isAuthenticated()){
            return next();
        }
        req.flash('error_msg', 'You must be logged in to view that page');
        res.redirect('/users/login');
    }
}