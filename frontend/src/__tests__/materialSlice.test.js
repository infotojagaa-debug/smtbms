import materialReducer, { 
    setMaterials, 
    setLoading, 
    setError 
  } from '../redux/slices/materialSlice';
  
  describe('Material State Logic (Redux) Tests', () => {
    const initialState = {
      materials: [],
      material: null,
      loading: false,
      error: null,
      pages: 1,
      stats: null
    };
  
    it('should initialize with accurate default metrics', () => {
      expect(materialReducer(undefined, { type: undefined })).toEqual(initialState);
    });
  
    it('should transition to high-fidelity loading magnitude during pending cycles', () => {
      const state = materialReducer(initialState, setLoading(true));
      expect(state.loading).toBe(true);
    });
  
    it('should hydrate materials array upon mission-critical fulfillment', () => {
      const mockMaterials = [{ _id: '1', name: 'Artifact-A' }];
      const state = materialReducer(initialState, setMaterials({ materials: mockMaterials, pages: 2 }));
      expect(state.materials).toEqual(mockMaterials);
      expect(state.pages).toBe(2);
    });
  
    it('should anchor categorical errors upon registry failure', () => {
      const state = materialReducer(initialState, setError('Registry Integrity Failure'));
      expect(state.error).toBe('Registry Integrity Failure');
    });
  });
  
