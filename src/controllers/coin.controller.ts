import {inject} from '@loopback/core';
import {
  Count,
  CountSchema,
  DataObject,
  Filter,
  FilterExcludingWhere,
  repository,
  Where
} from '@loopback/repository';
import {
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  requestBody,
  response,
} from '@loopback/rest';
import {Coin, CoinData, CoinMetaData, TokenLinks, TokenMetrics, TokenNewsItem} from '../models';
import {CoinDataRepository, CoinMetaDataRepository, CoinRepository} from '../repositories';
import {Atoma, Blockberry, NewsItem, Searapi} from '../services';

//const envData = loadEnv()?.parsed;

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export class CoinController {
  constructor(
    @repository(CoinRepository) public coinRepository: CoinRepository,
    @repository(CoinDataRepository) protected coinDataRepository: CoinDataRepository,
    @repository(CoinMetaDataRepository) protected coinMetaDataRepository: CoinMetaDataRepository,
    @inject('services.blockberry') protected blockberry: Blockberry,
    @inject('services.searapi') protected searapi: Searapi,
    @inject('services.atoma') protected atoma: Atoma,
  ) { }

  @post('/coins')
  @response(200, {
    description: 'Coin model instance',
    content: {'application/json': {schema: getModelSchemaRef(Coin)}},
  })

  async loadCachedCoinData(id: string): Promise<CoinData | null> {
    let cachedData = await this.coinDataRepository.findOne({
      where: {
        coinType: id,
      }
    });

    if (cachedData === null) {
      // wait 15 sec between queries
      await delay(15000);
      const coinData = await this.blockberry.getCoinByCoinType(id);
      if (coinData.coinType !== id) {
        return null;
      }
      cachedData = await this.coinDataRepository.create(coinData);
    }

    return cachedData;
  }

  async loadCachedCoinMetaData(id: string): Promise<CoinMetaData | null> {
    let cachedMetaData = await this.coinMetaDataRepository.findOne({
      where: {
        coinType: id,
      }
    });
    if (cachedMetaData === null) {
      // wait 15 sec between queries
      await delay(15000);
      const coinMetaData = await this.blockberry.getCoinMetadata(id);
      if (coinMetaData.coinType !== id) {
        return null;
      }
      const newData = {
        coinType: coinMetaData.coinType,
        totalSupply: coinMetaData.totalSupply,
        volume: coinMetaData.volume,
        socialWebsite: coinMetaData.socialWebsite,
        socialDiscord: coinMetaData.socialDiscord,
        socialEmail: coinMetaData.socialEmail,
        socialGitHub: coinMetaData.socialGitHub,
        socialTelegram: coinMetaData.socialTelegram,
        socialTwitter: coinMetaData.socialTwitter,
      }
      cachedMetaData = await this.coinMetaDataRepository.create(newData);
    }

    return cachedMetaData;
  }

  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Coin, {
            title: 'NewCoin',
          }),
        },
      },
    })
    coin: Coin,
  ): Promise<Coin> {
    return this.coinRepository.create(coin);
  }

  @get('/coins/count')
  @response(200, {
    description: 'Coin model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Coin) where?: Where<Coin>,
  ): Promise<Count> {
    return this.coinRepository.count(where);
  }

  @get('/coins')
  @response(200, {
    description: 'Array of Coin model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Coin, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Coin) filter?: Filter<Coin>,
  ): Promise<Coin[]> {
    return this.coinRepository.find(filter);
  }

  @get('/coins/{id}')
  @response(200, {
    description: 'Coin model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Coin, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Coin, {exclude: 'where'}) filter?: FilterExcludingWhere<Coin>
  ): Promise<Coin> {
    return this.coinRepository.findById(id, filter);
  }

  @patch('/coins/{id}')
  @response(204, {
    description: 'Coin PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Coin, {partial: true}),
        },
      },
    })
    coin: Coin,
  ): Promise<void> {
    await this.coinRepository.updateById(id, coin);
  }

  @get('/coins/{symbol}')
  @response(200, {
    description: 'Coin model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Coin, {includeRelations: true}),
      },
    },
  })
  async findBySymbol(
    @param.path.string('symbol') symbol: string,
  ): Promise<Coin | null> {
    return this.coinRepository.findOne({
      where: {
        symbol: symbol,
      }
    });
  }

  @get('/coins/{name}', {
    description: "Find coin by name",
    responses: {
      default: {
        description: 'Coin model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Coin, {includeRelations: true}),
          },
        },
      }
    }
  })
  @response(200, {
    description: 'Coin model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Coin, {includeRelations: true}),
      },
    },
  })
  async findByName(
    @param.path.string('name') name: string,
  ): Promise<Coin | null> {
    return this.coinRepository.findOne({
      where: {
        name: name,
      }
    });
  }

  @get('/coins/loadById')
  @response(200, {
    description: 'Coin model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Coin, {includeRelations: true}),
      },
    },
  })
  async loadById(
    @param.query.string('id') id: string,
  ): Promise<Coin | null | undefined> {
    let coin = await this.coinRepository.findOne({
      where: {id: id}
    });
    if (coin === null) {
      coin = await this.coinRepository.findOne({
        where: {name: id}
      });
    }
    if (coin === null) {
      coin = await this.coinRepository.findOne({
        where: {address: id}
      });
    }
    if (coin === null) {
      coin = await this.coinRepository.findOne({
        where: {symbol: id}
      });
    }
    if (coin === null) {
      const coinData = await this.loadCachedCoinData(id);
      if (coinData === null) {
        return null;
      }
      const newCoin: DataObject<Coin> = {
        "id": coinData.coinType,
        "name": coinData.coinName,
        "address": coinData.objectId,
        "symbol": coinData.coinSymbol,
        "description": coinData.description,
        "llmSummary": null,
        "icon": coinData.imgUrl,
        "price": coinData.price?.toPrecision(2).toString(),
        "priceChange24h": null,
        "marketCapChange": null,
        "marketCap": coinData.marketCap,
        "volume24h": null,
        "volumeChange24h": null,
        "fdv": coinData.fdv,
        "volMktCap": null,
        "holders": coinData.holdersCount,
        "queryCount": 0,
        // objects
        "metrics": null,
        "dynamics": null,
        "recentArticles": null,
        "recentUpdates": null, // deprecated
        "links": null,
        "stakingPools": null,
        "news": null,
      }
      coin = await this.coinRepository.create(newCoin)

      const metricsObject: DataObject<TokenMetrics> = {
        holders: coinData.holdersCount,
        volume24h: null,
        marketCap: coinData.marketCap,
      };
      const metrics = new TokenMetrics(metricsObject);
      await this.coinRepository.updateById(id, {metrics: metrics})

      const coinMetaData = await this.loadCachedCoinMetaData(id);
      if (coinMetaData) {
        const coinLinks: DataObject<TokenLinks> = {
          website: coinMetaData.socialWebsite,
          whitepaper: null,
          contract: `https://suiscan.xyz/mainnet/object/${coinData.packageId}/contracts`,
          explorer: `https://suiscan.xyz/mainnet/coin/${coinData.coinType}`,
          telegram: coinMetaData.socialTelegram,
          twitter: coinMetaData.socialTwitter,
          discord: coinMetaData.socialDiscord
        };
        const links = new TokenLinks(coinLinks);
        await this.coinRepository.updateById(id, {links: links})
      }
    }

    if ((!coin?.news) || (coin?.news.length === 0)) {
      const q = `${coin.symbol} crypto token`;
      const searchResults0 = await this.searapi.searchNews(q);
      const searchResults: Array<NewsItem> = searchResults0[0];
      //console.log('searchResults');
      //console.log(searchResults);

      const newsItems = [];
      for (const resultData of searchResults) {
        //console.log(resultData);
        const newsItem: DataObject<TokenNewsItem> = {
          position: resultData.position,
          link: resultData.link,
          title: resultData.title,
          source: resultData.source,
          date: resultData.date,
          snippet: resultData.snippet,
          thumbnail: resultData.thumbnail,
        };
        newsItems.push(newsItem);
      }
      await this.coinRepository.updateById(id, {news: newsItems});
      //console.log(newsItems);
    }

    if ((coin.description) && (!coin.llmSummary)) {
      const llmPrompt = `I have a default description of ${coin.symbol} crypto token: ` +
        `'${coin.description}'. ` +
        "Could you please transfrom and make value proposition " +
        "more clear and human readable (for basic crypto user) of the project, " +
        "base on the information you have and you can search. " +
        "Otherwise return provided basic value. 2-3 sentances max.";
      const llmMessages = [
        {
          "role": "user",
          "content": llmPrompt,
        }
      ];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let llmResponse: any = await this.atoma.simplePrompt(llmMessages);
      llmResponse = llmResponse[0];
      llmResponse = llmResponse[0];
      console.log(llmResponse);
      const llmSummary = llmResponse.message.content;

      await this.coinRepository.updateById(id, {llmSummary: llmSummary});
    }

    // update query count
    let newQueryCount = coin?.queryCount;
    if (!newQueryCount) {
      newQueryCount = 1;
    } else {
      newQueryCount = parseInt(`${newQueryCount}`) + 1;
    }
    await this.coinRepository.updateById(id, {queryCount: newQueryCount});

    return this.coinRepository.findById(coin.id);
  }

  /*@get('/coins/{id}/links')
  @response(200, {
    description: 'Coin model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Coin, {includeRelations: true}),
      },
    },
  })
  async loadLinks(
    @param.path.string('id') id: string,
  ): Promise<TokenLinks | undefined | null> {
    const filter = {};
    const coin = await this.coinRepository.findById(id, filter);

    if (coin === null) {
      return null
    }
    if (coin.links === null) {
      const coinMetadata = await this.blockberry.getCoinMetadata(id);
      if (coinMetadata) {
        const coinLinks: DataObject<TokenLinks> = {
          website: coinMetadata.socialWebsite,
          whitepaper: null,
          contract: null,
          explorer: `https://suiscan.xyz/mainnet/coin/${id}`,
          telegram: coinMetadata.socialTelegram,
          twitter: coinMetadata.socialTwitter,
          discord: coinMetadata.socialDiscord
        };
        coin.links = new TokenLinks(coinLinks);
        await this.coinRepository.updateById(id, coin);
      }
      return <TokenLinks>coin.links;
    }
  }*/
}
