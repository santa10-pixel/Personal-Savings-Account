import { prisma } from '../lib/prisma';
import { mockProducts } from '../lib/mock-data';

async function main() {
  console.log('Start seeding...');
  
  for (const product of mockProducts) {
    const dataToSave = {
      title: product.title,
      brand: product.brand,
      category: product.category,
      subcategory: product.subcategory,
      originalPrice: product.originalPrice,
      discountedPrice: product.discountedPrice,
      offerPercentage: product.offerPercentage,
      stock: product.stock,
      rating: product.rating,
      reviews: product.reviews,
      images: JSON.stringify(product.images),
      colors: JSON.stringify(product.colors),
      sizes: JSON.stringify(product.sizes),
      fabricType: product.fabricType || null,
      styleTags: product.styleTags ? JSON.stringify(product.styleTags) : null,
      estimatedDelivery: product.estimatedDelivery,
    };

    const createdProduct = await prisma.product.upsert({
      where: { id: product.id },
      update: dataToSave,
      create: {
        id: product.id,
        ...dataToSave
      },
    });
    console.log(`Created product with id: ${createdProduct.id}`);
  }
  
  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
