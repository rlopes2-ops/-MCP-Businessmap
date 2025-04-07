import axios, { AxiosInstance } from 'axios';
import { 
  BusinessmapConfig, 
  Card, 
  Comment, 
  SearchParams, 
  CardCreateParams,
  CardUpdateParams,
  Board
} from './types';

export class BusinessmapClient {
  private client: AxiosInstance;
  private config: BusinessmapConfig;
  
  constructor(config: BusinessmapConfig) {
    this.config = config;
    
    this.client = axios.create({
      baseURL: this.config.url,
      headers: {
        'apikey': this.config.apikey,
        'Content-Type': 'application/json'
      },
      validateStatus: (status) => status < 500
    });
  }
  
  private checkReadOnly(operation: string): void {
    if (this.config.readOnly) {
      throw new Error(`Cannot perform operation "${operation}" in read-only mode`);
    }
  }
  
  // Busca cards no Businessmap
  async searchCards(params: SearchParams): Promise<Card[]> {
    try {
      const response = await this.client.get('/api/v2/cards', {
        params: {
          query: params.query,
          board_ids: params.boardIds ? params.boardIds.join(',') : undefined,
          limit: params.maxResults || 50
        }
      });
      
      if (response.status !== 200) {
        throw new Error(`Failed to search cards: ${response.statusText}`);
      }
      
      // Filtrar por boards se necessário
      let results = response.data.data || [];
      if (this.config.boardsFilter && this.config.boardsFilter.length > 0) {
        results = results.filter((card: any) => 
          this.config.boardsFilter!.includes(card.board_id.toString())
        );
      }
      
      // Transformar para o formato esperado
      return results.map((card: any) => ({
        id: card.id.toString(),
        title: card.title,
        description: card.description,
        boardId: card.board_id.toString(),
        columnId: card.column_id?.toString(),
        laneId: card.lane_id?.toString(),
        priority: card.priority,
        assigneeIds: card.assignee_ids?.map((id: number) => id.toString()),
        tags: card.tags,
        createdAt: card.created_at,
        updatedAt: card.updated_at
      }));
    } catch (error: any) {
      console.error('Error searching cards:', error.message);
      throw error;
    }
  }
  
  // Obter detalhes de um card específico
  async getCard(cardId: string): Promise<Card> {
    try {
      const response = await this.client.get(`/api/v2/cards/${cardId}`);
      
      if (response.status !== 200) {
        throw new Error(`Failed to get card: ${response.statusText}`);
      }
      
      const card = response.data;
      return {
        id: card.id.toString(),
        title: card.title,
        description: card.description,
        boardId: card.board_id.toString(),
        columnId: card.column_id?.toString(),
        laneId: card.lane_id?.toString(),
        priority: card.priority,
        assigneeIds: card.assignee_ids?.map((id: number) => id.toString()),
        tags: card.tags,
        createdAt: card.created_at,
        updatedAt: card.updated_at
      };
    } catch (error: any) {
      console.error(`Error getting card ${cardId}:`, error.message);
      throw error;
    }
  }
  
  // Criar um novo card
  async createCard(params: CardCreateParams): Promise<Card> {
    this.checkReadOnly('createCard');
    
    try {
      const response = await this.client.post('/api/v2/cards', {
        board_id: params.boardId,
        workflow_id: params.workflowId,
        lane_id: params.laneId,
        column_id: params.columnId,
        title: params.title,
        description: params.description,
        priority: params.priority,
        assignee_ids: params.assigneeIds
      });
      
      if (response.status !== 201) {
        throw new Error(`Failed to create card: ${response.statusText}`);
      }
      
      const card = response.data;
      return {
        id: card.id.toString(),
        title: card.title,
        description: card.description,
        boardId: card.board_id.toString(),
        columnId: card.column_id?.toString(),
        laneId: card.lane_id?.toString(),
        priority: card.priority,
        assigneeIds: card.assignee_ids?.map((id: number) => id.toString()),
        tags: card.tags,
        createdAt: card.created_at,
        updatedAt: card.updated_at
      };
    } catch (error: any) {
      console.error('Error creating card:', error.message);
      throw error;
    }
  }
  
  // Atualizar um card existente
  async updateCard(params: CardUpdateParams): Promise<Card> {
    this.checkReadOnly('updateCard');
    
    try {
      const updateData: any = {};
      if (params.title) updateData.title = params.title;
      if (params.description) updateData.description = params.description;
      if (params.columnId) updateData.column_id = params.columnId;
      if (params.laneId) updateData.lane_id = params.laneId;
      if (params.priority) updateData.priority = params.priority;
      if (params.assigneeIds) updateData.assignee_ids = params.assigneeIds;
      
      const response = await this.client.patch(`/api/v2/cards/${params.cardId}`, updateData);
      
      if (response.status !== 200) {
        throw new Error(`Failed to update card: ${response.statusText}`);
      }
      
      const card = response.data;
      return {
        id: card.id.toString(),
        title: card.title,
        description: card.description,
        boardId: card.board_id.toString(),
        columnId: card.column_id?.toString(),
        laneId: card.lane_id?.toString(),
        priority: card.priority,
        assigneeIds: card.assignee_ids?.map((id: number) => id.toString()),
        tags: card.tags,
        createdAt: card.created_at,
        updatedAt: card.updated_at
      };
    } catch (error: any) {
      console.error(`Error updating card ${params.cardId}:`, error.message);
      throw error;
    }
  }
  
  // Excluir um card
  async deleteCard(cardId: string): Promise<boolean> {
    this.checkReadOnly('deleteCard');
    
    try {
      const response = await this.client.delete(`/api/v2/cards/${cardId}`);
      
      if (response.status !== 204) {
        throw new Error(`Failed to delete card: ${response.statusText}`);
      }
      
      return true;
    } catch (error: any) {
      console.error(`Error deleting card ${cardId}:`, error.message);
      throw error;
    }
  }
  
  // Adicionar comentário a um card
  async addComment(cardId: string, text: string): Promise<Comment> {
    this.checkReadOnly('addComment');
    
    try {
      const response = await this.client.post(`/api/v2/cards/${cardId}/comments`, {
        text: text
      });
      
      if (response.status !== 201) {
        throw new Error(`Failed to add comment: ${response.statusText}`);
      }
      
      const comment = response.data;
      return {
        id: comment.id.toString(),
        cardId: comment.card_id.toString(),
        text: comment.text,
        authorId: comment.author_id.toString(),
        authorName: comment.author_name,
        createdAt: comment.created_at
      };
    } catch (error: any) {
      console.error(`Error adding comment to card ${cardId}:`, error.message);
      throw error;
    }
  }
  
  // Listar quadros disponíveis
  async listBoards(): Promise<Board[]> {
    try {
      const response = await this.client.get('/api/v2/boards');
      
      if (response.status !== 200) {
        throw new Error(`Failed to list boards: ${response.statusText}`);
      }
      
      let boards = response.data.data || [];
      
      // Filtrar boards se necessário
      if (this.config.boardsFilter && this.config.boardsFilter.length > 0) {
        boards = boards.filter((board: any) => 
          this.config.boardsFilter!.includes(board.id.toString())
        );
      }
      
      return boards.map((board: any) => ({
        id: board.id.toString(),
        name: board.name,
        description: board.description
      }));
    } catch (error: any) {
      console.error('Error listing boards:', error.message);
      throw error;
    }
  }
  
  // Obter detalhes de um quadro específico
  async getBoard(boardId: string): Promise<Board> {
    try {
      const response = await this.client.get(`/api/v2/boards/${boardId}`);
      
      if (response.status !== 200) {
        throw new Error(`Failed to get board: ${response.statusText}`);
      }
      
      const board = response.data;
      return {
        id: board.id.toString(),
        name: board.name,
        description: board.description
      };
    } catch (error: any) {
      console.error(`Error getting board ${boardId}:`, error.message);
      throw error;
    }
  }
} 