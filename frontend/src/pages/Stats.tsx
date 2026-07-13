import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { User as UserLogo, TrendingUp, ShoppingBag } from 'lucide-react';
import { getRequest, getUserProfile } from "../utils/apiRequest";

import './Stats.css';


export const Stats: React.FC = () => {


  interface Order {
      orderId: number;
      content: string;
      time: string;
      status: number;
      issuer: string;
      seller: string;
  }

  interface ProductStats {
    name: string;
    category: number;
    totalSales: number;
    lastSaleDate: Date | null;
    lastSaleOrder: number | null;
  }

  const calculateSalesData = (orders: Order[]) => {
  const salesByHour: Record<number, number> = {};
  
  // Calculer les ventes réelles
  orders.forEach(order => {
    const orderDate = new Date(order.time);
    const hour = orderDate.getHours();
    
    const content: {items: {name: string, category: number, quantity: number}[]} = JSON.parse(order.content);
    const totalQuantity = content.items.reduce((sum, item) => sum + item.quantity, 0);
    
    salesByHour[hour] = (salesByHour[hour] || 0) + totalQuantity;
  });
  
  // Créer un tableau pour TOUTES les heures (0-23) avec 0 par défaut
  const hourlyData = [];
  for (let hour = 0; hour < 24; hour++) {
    hourlyData.push({
      time: `${hour.toString().padStart(2, '0')}:00`,
      sales: salesByHour[hour] || 0  // 0 si pas de ventes à cette heure
    });
  }
  
  return hourlyData;
};

  const initialize = async () => {
      const datas = await fetchOrdersData();
      const realSalesData = calculateSalesData(datas);
      setSalesData(realSalesData);
      const bests = await getBestIssuerAndSeller(datas);
      await setAvatars(bests.bestIssuer, bests.bestSeller);
      const calculatedStats = calculateProductStats(datas);
      await loadItemsAvatars(calculatedStats);
      setTopProducts(calculatedStats
      .sort((a, b) => b.totalSales - a.totalSales)
      .map((product, index) => ({
        ...product,
        rank: index + 1,
        categoryInfo: categoryMapping[product.category],
        lastSale: getTimeSinceLastSale(product.lastSaleDate)
      })));
  }

  useEffect(() => {
      initialize();
  }, []);


  const loadItemsAvatars = async (products : ProductStats[]) => {
      const avatars : Record<string, string> = {};
      for (const product of products) {
          if (!avatars[product.name]) { 
              const avatar = await getItemAvatar(product.category, product.name);
              if (avatar) {
                  avatars[`${product.category}/${product.name}`] = avatar;
              } else {
                  avatars[`${product.category}/${product.name}`] = '';
              } 
          }
      }
      setProductAvatars(avatars);
    }
    const getBestIssuerAndSeller = (data : Order[] | []) => {
        if (data.length === 0) {
            setBestIssuer('');
            setBestSeller('');
            return {bestIssuer: '', bestSeller: ''};
        }
        const issuerCount: Record<string, number> = {};
        const sellerCount: Record<string, number> = {};

        data.forEach(order => {
        const { issuer, seller } = order;
        issuerCount[issuer] = (issuerCount[issuer] || 0) + 1;
        sellerCount[seller] = (sellerCount[seller] || 0) + 1;
        });

        const bestIssuer = Object.keys(issuerCount).reduce((best, current) => 
        issuerCount[current] > issuerCount[best] ? current : best
        );

        const bestSeller = Object.keys(sellerCount).reduce((best, current) => 
        sellerCount[current] > sellerCount[best] ? current : best
        );

        setBestIssuer(bestIssuer);
        setBestSeller(bestSeller);
        return { bestIssuer, bestSeller };
    };

    const getItemAvatar = async (category : number, name : string) => {
      const itemResponse = await getRequest(`projects/${localStorage.getItem('stocksProjectId')}/files/item/${category}/${name}`, localStorage.getItem('token'));
      if (itemResponse.success && itemResponse.data) {
        const response = itemResponse.data;
        return (response as { icon : string}).icon;
      }
    }

    const calculateProductStats = (data : Order[]) => {
      const productStats : Record<string, ProductStats> = {};
      
      data.forEach(order => {
        const content : {items : {name : string, category : number, quantity : number}[]} = JSON.parse(order.content); // as {name : string, category : number, quantity : number}[]
        content.items.forEach(product => {
          const { name, quantity, category } = product;
          
          if (!productStats[name]) {
            productStats[name] = {
              name,
              category,
              totalSales: 0,
              lastSaleDate: null,
              lastSaleOrder: null,
            };
          }
          
          productStats[name].totalSales += quantity;
          
          const orderDate = new Date(order.time);
          if (!productStats[name].lastSaleDate || orderDate > productStats[name].lastSaleDate) {
            productStats[name].lastSaleDate = orderDate;
            productStats[name].lastSaleOrder = order.orderId;
          }
        });
      });
      return Object.values(productStats);
  };

  const getTimeSinceLastSale = (lastSaleDate : Date | null) => {
    if(!lastSaleDate) {
      return "Never sold";
    }
    const now = new Date();
    const diffInMs = now.getTime() - lastSaleDate.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInMinutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffInHours > 0) {
      return `${diffInHours}h ago`;
    } else {
      return `${diffInMinutes}min ago`;
    }
  };

  const categoryMapping : Record<number, { name: string; icon: string;}> = {
    0: { name: "Snack", icon: "🍿" },
    1: { name: "Drinks", icon: "🥤"},
    2: { name: "Noodle", icon: "🍜"},
    3: { name: "Ice-Creams", icon: "🍦"}
  };

  const [issuerAvatar, setIssuerAvatar] = useState<string>('');
  const [sellerAvatar, setSellerAvatar] = useState<string>('');
  const [ bestIssuer, setBestIssuer ] = useState<string>('');
  const [ bestSeller, setBestSeller ] = useState<string>('');
  const [productAvatars, setProductAvatars] = useState<Record<string, string>>({});
  const [topProducts, setTopProducts] = useState<Array<ProductStats & {
    rank: number;
    categoryInfo: { name: string; icon: string };
    lastSale: string;
  }>>([]);
  const [salesData, setSalesData] = useState<{time: string, sales: number}[]>([]);

    const setAvatars = async (issuer : string, seller : string) => {
      if (!issuer) {
        setIssuerAvatar('');
      }
      else{
        const issuerDatas = await getUserProfile(issuer);
        setIssuerAvatar(issuerDatas.avatar || '');
      }

      if (!seller || seller === 'undefined') {
        setSellerAvatar('');
      }
      else{
        const sellerDatas = await getUserProfile(seller);
        setSellerAvatar(sellerDatas.avatar || '');
      }
    }


    const fetchOrdersData = async () => {
      const response = await getRequest<Order[]>('order/orders');
      return response.data || [];
    }
    return (
        <main className="page-content">
            <div className="stat-grid">
              <div>
                <h2>Sales</h2>
                <ResponsiveContainer width="100%" height={325}>
                <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#fdf0d5" 
                    strokeWidth={2}
                    dot={{ fill: '#fdf0d5', r: 6 }}
                />
                    <Tooltip 
                        labelStyle={{ color: '#003049' }}
                        itemStyle={{ color: '#003049' }} 
                    />
                </LineChart>
                </ResponsiveContainer>
            </div>
            <div className="cards-container">
              <div className="best-card">
                  <div className="chip-base chip-buyer">
                      <ShoppingBag size={20} color="#fdf0d5" />
                  </div>
                  <div className="avatar-container">
                      <div className="crown">👑</div>
                      {issuerAvatar !== '' ? (
                          <img src={issuerAvatar} alt="Issuer Avatar" style={{ width: '222px', height: '222px', borderRadius: '50%', objectFit: 'cover', objectPosition: 'center'}} />
                      ) : (
                          <UserLogo size={222} color="#003049" />
                      )}
                  </div>
                  <h2>Best buyer of the month: </h2>
                  <h2>{bestIssuer}</h2>
              </div>
              <div className="best-card">
                  <div className="chip-base chip-seller">
                      <TrendingUp size={20} color="#fdf0d5" />
                  </div>
                  <div className="avatar-container">
                      <div className="crown">👑</div>
                      {sellerAvatar !== '' ? (
                          <img src={sellerAvatar} alt="Seller Avatar" style={{ width: '222px', height: '222px', borderRadius: '50%', objectFit: 'cover', objectPosition: 'center'}} />
                      ) : (
                          <UserLogo size={222} color="#003049" />
                      )}
                  </div>
                  <h2>Best seller of the month: </h2>
                  <h2>{bestSeller}</h2>
              </div>
          </div>
            <div className="top-products">
                <h2>Top Products</h2>
                <div className="top-products-list">  
                    {topProducts.map((product) => (
                        <div key={product.rank} className="top-product-card">
                            <div>
                                <div className="product-card-header">
                                  <img src={productAvatars[`${product.category}/${product.name}`] || ''} alt={product.name} style={{width: '80px', height: '80px', borderRadius: '15%', objectFit: 'cover'}} />
                                  <div style={{display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '12px'}}>
                                      <b>{product.name}</b>
                                      <span style={{fontSize: '48px'}}>{product.rank}</span>
                                  </div>
                                </div>
                                <div style={{textAlign: 'left', paddingLeft: '16px', fontSize: '20px'}}>
                                <p>Total Sales: {product.totalSales}</p>
                                <p>Last Sale: {product.lastSale}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="next-restock">
                <h3>Next Restock: Not Enough Data</h3>
                <div className="next-restock-grid">
                  {topProducts.map((product) => (
                    <div>
                      <div style={{display: 'flex', textAlign: 'center'}}>
                        <img src={productAvatars[`${product.category}/${product.name}`] || ''} alt={product.name} style={{width: '64px', height: '64px', borderRadius: '15%', objectFit: 'cover'}} />
                        <div style={{display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '12px', textAlign: 'left'}}>
                          <span>{product.name}</span>
                          <span>x {product.totalSales}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
            </div>
          </div>
        </main>
    );
};