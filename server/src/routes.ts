import express from 'express'

const routes = express.Router()

routes.get('', function(resquest, response){
  return response.json({name: 'Ecoleta', version: '1.0.0'})
})


export default routes