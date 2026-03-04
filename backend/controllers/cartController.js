import supabase from '../supabaseClient.js'

// Get user ID from request (assuming auth middleware)
function getUserId(req) {
  // This is a placeholder. In a real app, you'd get this from a session or token.
  if (req.user) {
    return req.user.id
  }
  // For now, returning a hardcoded ID for testing if no user is present
  return 'a1b2c3d4-e5f6-7890-1234-567890abcdef'
}

export async function getCart(req, res) {
  const userId = getUserId(req)
  try {
    // Fetch cart items and join with products to get product details
    const { data, error } = await supabase
      .from('cart_items')
      .select(
        `
        id,
        quantity,
        products:product_id (
          id,
          name,
          price,
          image
        )
      `
      )
      .eq('user_id', userId)

    if (error) return res.status(500).json({ error: error.message })

    // The result from Supabase is an array of items, which is what a cart representation should be.
    return res.json(data)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

export async function addItemToCart(req, res) {
  const userId = getUserId(req)
  const { product_id, quantity } = req.body

  if (!product_id || !quantity) {
    return res.status(400).json({ error: 'product_id and quantity are required' })
  }

  try {
    // Check if the item already exists in the cart
    const { data: existingItem, error: selectError } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', userId)
      .eq('product_id', product_id)
      .single()

    if (selectError && selectError.code !== 'PGRST116') {
      // PGRST116 means no rows found, which is fine.
      return res.status(500).json({ error: selectError.message })
    }

    if (existingItem) {
      // If item exists, update the quantity
      const newQuantity = existingItem.quantity + quantity
      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', existingItem.id)
        .select()
        .single()

      if (error) return res.status(500).json({ error: error.message })
      return res.json(data)
    } else {
      // If item does not exist, insert it
      const { data, error } = await supabase
        .from('cart_items')
        .insert([{ user_id: userId, product_id, quantity }])
        .select()
        .single()

      if (error) return res.status(500).json({ error: error.message })
      return res.status(201).json(data)
    }
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

export async function updateCartItem(req, res) {
  const userId = getUserId(req)
  const { id } = req.params
  const { quantity } = req.body

  if (!quantity || quantity <= 0) {
    // If quantity is zero or less, remove the item instead
    return removeCartItem(req, res)
  }

  try {
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', id)
      .eq('user_id', userId) // Ensure user can only update their own cart items
      .select()
      .single()

    if (error) return res.status(500).json({ error: error.message })
    if (!data) return res.status(404).json({ error: 'Cart item not found' })

    return res.json(data)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

export async function removeCartItem(req, res) {
  const userId = getUserId(req)
  const { id } = req.params

  try {
    const { data, error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', id)
      .eq('user_id', userId) // Ensure user can only delete their own cart items
      .select()
      .single()

    if (error) return res.status(500).json({ error: error.message })
    if (!data) return res.status(404).json({ error: 'Cart item not found or already deleted' })

    return res.status(200).json({ success: true, deleted: data })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

export async function clearCart(req, res) {
  const userId = getUserId(req)

  try {
    const { data, error } = await supabase.from('cart_items').delete().eq('user_id', userId)

    if (error) return res.status(500).json({ error: error.message })

    return res.status(200).json({ success: true, message: 'Cart cleared' })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
