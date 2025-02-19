import {inject} from '@loopback/core';
import {
  repository
} from '@loopback/repository';
import {TokenRepository} from '../repositories';
import {Blockberry} from '../services';

export class TokenController {
  constructor(
    @repository(TokenRepository)
    public tokenRepository: TokenRepository,
    @inject('services.blockberry') protected blockberryService: Blockberry,
  ) { }

  /*@post('/tokens')
  @response(200, {
    description: 'Token model instance',
    content: {'application/json': {schema: getModelSchemaRef(Token)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Token, {
            title: 'NewToken',
            exclude: ['createdAt', 'updatedAt'],
          }),
        },
      },
    })
    token: Token, //Omit<Token, 'id'>,
  ): Promise<Token> {
    return this.tokenRepository.create(token);
  }

  @get('/tokens/count')
  @response(200, {
    description: 'Token model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Token) where?: Where<Token>,
  ): Promise<Count> {
    return this.tokenRepository.count(where);
  }

  @get('/tokens')
  @response(200, {
    description: 'Array of Token model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Token, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Token) filter?: Filter<Token>,
  ): Promise<Token[]> {
    return this.tokenRepository.find(filter);
  }

  /*@patch('/tokens')
  @response(200, {
    description: 'Token PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Token, {partial: true}),
        },
      },
    })
    token: Token,
    @param.where(Token) where?: Where<Token>,
  ): Promise<Count> {
    return this.tokenRepository.updateAll(token, where);
  }*/

  /*@get('/tokens/{id}')
  @response(200, {
    description: 'Token model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Token, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Token, {exclude: 'where'}) filter?: FilterExcludingWhere<Token>
  ): Promise<Token> {
    return this.tokenRepository.findById(id, filter);
  }

  @patch('/tokens/{id}')
  @response(204, {
    description: 'Token PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Token, {partial: true, exclude: ['createdAt', 'updatedAt']}),
        },
      },
    })
    token: Token,
  ): Promise<void> {
    await this.tokenRepository.updateById(id, token);
  }

  @put('/tokens/{id}')
  @response(204, {
    description: 'Token PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() token: Token,
  ): Promise<void> {
    await this.tokenRepository.replaceById(id, token);
  }

  @del('/tokens/{id}')
  @response(204, {
    description: 'Token DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.tokenRepository.deleteById(id);
  }*/

  /// TokenQueries

  /*@get('/tokens/{id}/token-queries', {
    responses: {
      '200': {
        description: 'Array of Token has many TokenQuery',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(TokenQuery)},
          },
        },
      },
    },
  })
  async findTokenQueries(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<TokenQuery>,
  ): Promise<TokenQuery[]> {
    return this.tokenRepository.tokenQueries(id).find(filter);
  }

  @get('/tokens/{id}/accounts', {
    description: 'All wallets requested info about this token',
    responses: {
      '200': {
        description: 'Array of Token has many Account through TokenQuery',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Account)},
          },
        },
      },
    },
  })
  async findAccountsRequestedThisToken(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Account>,
  ): Promise<Account[]> {
    return this.tokenRepository.accounts(id).find(filter);
  }*/
}
