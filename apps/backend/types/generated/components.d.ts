import type { Schema, Struct } from '@strapi/strapi'

export interface ECommerceCartItem extends Struct.ComponentSchema {
  collectionName: 'components_e_commerce_cart_items'
  info: {
    displayName: 'Cart Item'
  }
  attributes: {
    price: Schema.Attribute.Decimal & Schema.Attribute.Required
    product: Schema.Attribute.Relation<'oneToOne', 'api::product.product'>
    quantity: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          max: 1000
        },
        number
      >
  }
}

export interface SharedMedia extends Struct.ComponentSchema {
  collectionName: 'components_shared_media'
  info: {
    displayName: 'Media'
    icon: 'file-video'
  }
  attributes: {
    file: Schema.Attribute.Media<'images' | 'files' | 'videos'>
  }
}

export interface SharedQuote extends Struct.ComponentSchema {
  collectionName: 'components_shared_quotes'
  info: {
    displayName: 'Quote'
    icon: 'indent'
  }
  attributes: {
    body: Schema.Attribute.Text
    title: Schema.Attribute.String
  }
}

export interface SharedRichText extends Struct.ComponentSchema {
  collectionName: 'components_shared_rich_texts'
  info: {
    description: ''
    displayName: 'Rich text'
    icon: 'align-justify'
  }
  attributes: {
    body: Schema.Attribute.RichText
  }
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos'
  info: {
    description: ''
    displayName: 'Seo'
    icon: 'allergies'
    name: 'Seo'
  }
  attributes: {
    metaDescription: Schema.Attribute.Text & Schema.Attribute.Required
    metaTitle: Schema.Attribute.String & Schema.Attribute.Required
    shareImage: Schema.Attribute.Media<'images'>
  }
}

export interface SharedSlider extends Struct.ComponentSchema {
  collectionName: 'components_shared_sliders'
  info: {
    description: ''
    displayName: 'Slider'
    icon: 'address-book'
  }
  attributes: {
    files: Schema.Attribute.Media<'images', true>
  }
}

export interface SharedVariants extends Struct.ComponentSchema {
  collectionName: 'components_shared_variants'
  info: {
    displayName: 'variants'
    icon: 'bulletList'
  }
  attributes: {
    sku: Schema.Attribute.String
  }
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'e-commerce.cart-item': ECommerceCartItem
      'shared.media': SharedMedia
      'shared.quote': SharedQuote
      'shared.rich-text': SharedRichText
      'shared.seo': SharedSeo
      'shared.slider': SharedSlider
      'shared.variants': SharedVariants
    }
  }
}
