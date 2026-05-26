import { useState, React } from "react";
import "./WardrobeView.css";

const WardrobeView = () => {
  //const [wardrobe, setWardrobe] = useState([])
  const [wardrobe, setWardrobe] = useState([
    { id: 1, name: "White Tee", category: "tops", image_url: "https://www.houseofblanks.com/cdn/shop/files/HeavyweightTshirt_White_01_2.jpg?v=1726516822&width=713" },
    { id: 2, name: "Blue Jeans", category: "bottoms", image_url: "https://img.abercrombie.com/is/image/anf/KIC_155-4247-0173-278_prod1?policy=product-large" },
  ]);
  const grouped = {};

  wardrobe.forEach((item) => {
    if (!grouped[item.category]) {
      // create an empty array for this category
      grouped[item.category] = [];
    }
    // then push the item in
    grouped[item.category].push(item);
  });

  return (
    <div className="wardrobe-page">
      {wardrobe.length === 0 && <button className="wardrobe-empty-btn"> Add Clothing Items </button>}

      {Object.keys(grouped).map((category) => (
        <div key={category} className="wardrobe-category">
          <h2>{category}</h2>
          {grouped[category].map((item) => (
            <div key={item.id} className="wardrobe-item">
              <img src={item.image_url} alt={item.name} />
              <p>{item.name}</p>
            </div>
          ))}
        </div>
      ))}

      <button className="wardrobe-fab"> + </button>
    </div>
  );
};

export default WardrobeView;
