import { storage } from "./storage";

async function seedLoyaltyData() {
  console.log("Seeding loyalty program data...");

  // Add sample rewards
  const sampleRewards = [
    {
      name: "10% отстъпка",
      description: "10% отстъпка за следващо посещение",
      pointsCost: 100,
      rewardType: "discount",
      rewardValue: "10.00",
      minTier: "Bronze",
      isActive: true
    },
    {
      name: "Безплатен шампоан",
      description: "Безплатен професионален шампоан при следващо посещение",
      pointsCost: 150,
      rewardType: "free_service",
      rewardValue: "15.00",
      minTier: "Silver",
      isActive: true
    },
    {
      name: "20% отстъпка",
      description: "20% отстъпка за следващо посещение",
      pointsCost: 250,
      rewardType: "discount",
      rewardValue: "20.00",
      minTier: "Gold",
      isActive: true
    },
    {
      name: "VIP третман",
      description: "Безплатна брада и мустак услуга",
      pointsCost: 400,
      rewardType: "free_service",
      rewardValue: "35.00",
      minTier: "VIP",
      isActive: true
    },
    {
      name: "Продукт подарък",
      description: "Безплатен стилизиращ продукт на избор",
      pointsCost: 300,
      rewardType: "product",
      rewardValue: "25.00",
      minTier: "Gold",
      isActive: true
    }
  ];

  try {
    for (const reward of sampleRewards) {
      const rewards = await storage.getLoyaltyRewards();
      const exists = rewards.find(r => r.name === reward.name);
      
      if (!exists) {
        await storage.createLoyaltyReward(reward);
        console.log(`Created reward: ${reward.name}`);
      }
    }
    
    console.log("Loyalty program seeding completed!");
  } catch (error) {
    console.error("Error seeding loyalty data:", error);
  }
}

// Run seeding when called directly
seedLoyaltyData();

export { seedLoyaltyData };