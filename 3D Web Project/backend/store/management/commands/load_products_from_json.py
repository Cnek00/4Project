import json
import os
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from store.models import Category, Product, ProductSize, ProductColor


class Command(BaseCommand):
    help = 'JSON dosyasından ürünleri veritabanına yükler'

    def add_arguments(self, parser):
        parser.add_argument(
            '--file',
            type=str,
            default='fixtures/sample_products.json',
            help='JSON dosyasının yolu (default: fixtures/sample_products.json)'
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Önce tüm ürünleri ve kategorileri sil'
        )

    def handle(self, *args, **options):
        file_path = options['file']
        
        # Dosya yolunu proje base directory'sine göre düzelt
        if not os.path.isabs(file_path):
            from django.conf import settings
            file_path = os.path.join(settings.BASE_DIR, file_path)
        
        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(f'Dosya bulunamadı: {file_path}'))
            return

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except json.JSONDecodeError as e:
            self.stdout.write(self.style.ERROR(f'JSON hatası: {e}'))
            return
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Dosya okuma hatası: {e}'))
            return

        # Önceki verileri temizle
        if options['clear']:
            self.stdout.write('Mevcut veriler siliniyor...')
            Product.objects.all().delete()
            Category.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('Veriler silindi'))

        # Kategorileri yükle
        categories_loaded = 0
        if 'categories' in data:
            for cat_data in data['categories']:
                category, created = Category.objects.get_or_create(
                    slug=cat_data['slug'],
                    defaults={
                        'name_tr': cat_data.get('name_tr', ''),
                        'name_en': cat_data.get('name_en', ''),
                    }
                )
                if created:
                    categories_loaded += 1
                    self.stdout.write(self.style.SUCCESS(f'  ✓ Kategori eklendi: {category.name_en}'))
                else:
                    self.stdout.write(f'  - Kategori zaten mevcut: {category.name_en}')
        
        self.stdout.write(self.style.SUCCESS(f'\n{categories_loaded} kategori yüklendi'))

        # Ürünleri yükle
        products_loaded = 0
        if 'products' in data:
            for prod_data in data['products']:
                try:
                    # Kategoryi bul
                    category = Category.objects.get(slug=prod_data['category_slug'])
                    
                    # Ürünü oluştur veya güncelle
                    product, created = Product.objects.get_or_create(
                        slug=prod_data['slug'],
                        defaults={
                            'name_tr': prod_data.get('name_tr', ''),
                            'name_en': prod_data.get('name_en', ''),
                            'description_tr': prod_data.get('description_tr', ''),
                            'description_en': prod_data.get('description_en', ''),
                            'price': prod_data.get('price', '0'),
                            'currency': prod_data.get('currency', 'EUR'),
                            'category': category,
                            'is_visible': prod_data.get('is_visible', True),
                            'is_available': prod_data.get('is_available', True),
                            'low_stock_warning': prod_data.get('low_stock_warning', 5),
                        }
                    )
                    
                    if created:
                        products_loaded += 1
                        self.stdout.write(self.style.SUCCESS(f'  ✓ Ürün eklendi: {product.name_en}'))
                    else:
                        self.stdout.write(f'  - Ürün zaten mevcut: {product.name_en}')
                    
                    # Bedenleri ekle
                    if 'sizes' in prod_data:
                        for size_data in prod_data['sizes']:
                            size, size_created = ProductSize.objects.get_or_create(
                                product=product,
                                size_value=size_data['size_value'],
                                defaults={
                                    'stock': size_data.get('stock', 0),
                                    'price_override': size_data.get('price_override'),
                                }
                            )
                            if size_created:
                                label = size_data.get('label', size_data['size_value'])
                                self.stdout.write(f'    ✓ Beden eklendi: {label} (Stok: {size.stock})')
                            else:
                                # Stok güncelle
                                size.stock = size_data.get('stock', 0)
                                size.save()
                    
                    # Renkleri ekle
                    if 'colors' in prod_data:
                        for color_data in prod_data['colors']:
                            color, color_created = ProductColor.objects.get_or_create(
                                product=product,
                                name=color_data['name'],
                                defaults={
                                    'hex_code': color_data.get('hex_code', '#000000'),
                                }
                            )
                            if color_created:
                                self.stdout.write(f'    ✓ Renk eklendi: {color.name}')
                
                except Category.DoesNotExist:
                    self.stdout.write(self.style.ERROR(f'  ✗ Kategori bulunamadı: {prod_data["category_slug"]}'))
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'  ✗ Ürün yüklenirken hata: {prod_data["slug"]} - {e}'))
        
        self.stdout.write(self.style.SUCCESS(f'\n{products_loaded} ürün yüklendi\n'))
        self.stdout.write(self.style.SUCCESS('✓ İşlem tamamlandı!'))
