const db = {
  users: [
    {
      id: 1,
      company_name: "Farm Fresh",
      email: "seller@mail.com",
      password_hash: "hashed_pwd",
      phone: "0550000000",
      role: "seller",
      is_verified: true,
      first_name: "Ali",
      last_name: "Benali",
      avatar: "https://example.com/avatar.jpg",
      is_active: true,
      created_at: "2026-04-01"
    }
  ],

  company_verification: [
    {
      id: 1,
      user_id: 1,
      business_id: "RC123456",
      business_license: "https://example.com/license.pdf",
      status: "approved",
      verified_by: 99,
      created_at: "2026-04-01"
    }
  ],

  product_categories: [
    {
      id: 1,
      name: "Vegetables"
    }
  ],

  products: [
    {
      id: 1,
      seller_id: 1,
      category_id: 1,
      title: "Potatoes",
      description: "Fresh organic potatoes",
      quality: "A",
      quantity_available: 600,
      price_full_sale: 12000,
      starting_price: 50,
      location_id: 1,
      status: "active",
      start_time: "2026-04-01T10:00:00",
      end_time: "2026-04-02T10:00:00",
      created_at: "2026-04-01"
    }
  ],

  product_images: [
    {
      id: 1,
      product_id: 1,
      image_url: "https://example.com/potatoes.jpg"
    }
  ],

  bids: [
    {
      id: 1,
      product_id: 1,
      buyer_id: 2,
      quantity_requested: 200,
      price_per_kg: 55,
      total_price: 11000,
      status: "pending",
      created_at: "2026-04-01T12:00:00"
    }
  ],

  allocations: [
    {
      id: 1,
      product_id: 1,
      buyer_id: 2,
      bid_id: 1,
      allocated_quantity: 200,
      final_price: 11000,
      created_at: "2026-04-02"
    }
  ],

  buyer_preferences: [
    {
      id: 1,
      buyer_id: 2,
      category_id: 1
    }
  ],

  notifications: [
    {
      id: 1,
      user_id: 2,
      type: "bid_update",
      message: "Your bid has been accepted",
      is_read: false,
      created_at: "2026-04-02"
    }
  ],

  locations: [
    {
      id: 1,
      user_id: 1,
      id_wilaya: 25,
      id_commune: 2501,
      address: "Ali Mendjeli"
    }
  ],

  wilaya: [
    {
      id: 25,
      code: "25",
      name: "Constantine",
      ar_name: "قسنطينة",
      longitude: 6.6147,
      latitude: 36.365
    }
  ],

  commune: [
    {
      id: 2501,
      post_code: "25000",
      name: "Constantine",
      wilaya_id: 25,
      ar_name: "قسنطينة",
      longitude: 6.6147,
      latitude: 36.365
    }
  ]
};
