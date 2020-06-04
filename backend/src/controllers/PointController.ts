import { Request, Response } from "express";
import knex from "../database/connection";

class PointController {
  async index(request: Request, response: Response) {
    const { city, uf, items } = request.query;
 
    const parsedItems = String(items)
    .split(',')
    .map(item => Number(item.trim()))

    const points = await knex("points")
    .join('point_items', 'points.id', '=', 'point_items.point_id')
    .whereIn('point_items.item_id', parsedItems)
    .where('city', String(city))
    .where('uf', String(uf))
    .distinct()
    .select('points.*');

  
    return response.json(points);
  }

  async store(request: Request, response: Response) {
    const {
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
      items,
    } = request.body;

    const trx = await knex.transaction();
    
    try {

      const point = {
        image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=60",
        name,
        email,
        whatsapp,
        latitude,
        longitude,
        city,
        uf,
      };

      const insertedIds = await trx("points").insert(point);

      const point_id = insertedIds[0];

      const pointItems = items.map((item_id: number) => {
        return {
          item_id,
          point_id,
        };
      });

      await trx("point_items").insert(pointItems);

      await trx.commit();

      return response.json({
        id: point_id,
        ...point,
      });
    } catch (error) {
      await trx.rollback();

      return response
        .status(400)
        .json({
          message:
            "Falha na inserção na tabela point_items, verifique se os items informados são válidos",
        });
    }
  }

  async show(request: Request, response: Response) {
    const { id } = request.params;

    const point = await knex("points").where("id", id).first();

    const items = await knex('items')
    .select('items.title', 'items.image')
    .join('point_items', 'items.id', '=', 'point_items.item_id')
    .where('point_items.point_id', id);

    point.items = items;


    return response.json(point);
  }
}

export default PointController;
