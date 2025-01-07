const db = require('../config/db')
// Check profile completeness and return current preferences
exports.getTanah = async (req, res) => {

  const query = `
              SELECT 
                product.*, 
                user_preference.mobile AS mobile,
                CONCAT(user.first_name, ' ', user.last_name) AS seller_name
              FROM 
                product
              LEFT JOIN 
                user_preference 
              ON 
                user_preference.user_id = product.user_id
              LEFT JOIN 
                user 
              ON 
                user.id = product.user_id
              WHERE 
                product.category_id = 1;
            `;

  try {
    const [results] = await db.query(query);
    res.json({ product: results });  // Return the "Tanah" category products
  } catch (err) {
    res.status(500).json(err.message || 'Error fetching products');
  }


};

exports.getProduct = async (req, res) => {
  const term = req.query.q;
  const searchTerm = `%${term.toLowerCase()}%`;
  console.log(term)
  const query = `
     SELECT 
        product.*, 
        user_preference.mobile AS mobile,
        CONCAT(user.first_name, ' ', user.last_name) AS seller_name
    FROM 
        product
    LEFT JOIN 
        user_preference 
    ON 
        user_preference.user_id = product.user_id
    LEFT JOIN 
        user
    ON 
        user.id = product.user_id
    WHERE 
        LOWER(product_name) LIKE ? 
        OR 
        LOWER(product_desc) LIKE ? 
    ORDER BY 
        created_at DESC
    LIMIT 50
  `;
  try {
    const [results] = await db.query(query, [searchTerm, searchTerm]);
    res.json({ product: results });  // Return the search results
  } catch (err) {
    res.status(500).json(err.message || `Error fetching ${term} products`);
  }
};

exports.recommendedProduct = async (req, res) => {
  const user_id = req.user.id
  const query = `
    SELECT
p.user_id,
      p.product_name AS product_name,
      p.product_desc AS product_description,
      p.product_price AS product_price,
      user_preference.mobile AS mobile,
        CONCAT(user.first_name, ' ', user.last_name) AS seller_name,
      prov.name AS provence,
      dist.name AS district,
      sdist.name AS subdistrict,
      vill.name AS village,
      p.street AS street
    FROM 
      user_preference up
    LEFT JOIN 
      product p 
    ON 
      p.price_id = up.price_id
      OR 
      p.address_id = up.address_id
      OR
      p.category_id = up.category_id
      LEFT JOIN 
                user 
              ON 
                user.id = p.user_id
    LEFT JOIN 
      user_preference 
    ON 
      user_preference.user_id = p.user_id
    LEFT JOIN
      address a ON up.address_id = a.id
    LEFT JOIN 
      provence prov ON a.provence_id = prov.id
    LEFT JOIN 
      district dist ON a.district_id = dist.id
    LEFT JOIN 
      subdistrict sdist ON a.subdistrict_id = sdist.id
    LEFT JOIN 
      village vill ON a.village_id = vill.id
    WHERE
      up.user_id = ?;
  `;

  try {
    const [results] = await db.query(query, [user_id]);
    // If no results, return null
    if (results.length === 0) {
      res.json({ recommend: null })
    };

    res.json({ recommend: results });  // Return the recommended products
  } catch (err) {
    res.status(500).json(err.message || 'Error fetching recommend products');
  }
}

