import type { JSX } from 'hono/jsx';
import { Layout, Button, Input, Select, Textarea, Checkbox, Card, Table, Badge, Modal } from '../components';

export const ComponentsDemo = (): JSX.Element => {
  
  // Sample data for table
  const sampleData = [
    { id: 1, name: 'Store ABC', city: 'Casablanca', status: 'active' },
    { id: 2, name: 'Store XYZ', city: 'Rabat', status: 'active' },
    { id: 3, name: 'Store 123', city: 'Marrakech', status: 'inactive' },
  ];
  
  const tableColumns = [
    { key: 'id', label: 'ID', width: '80px' },
    { key: 'name', label: 'Nom', sortable: true },
    { key: 'city', label: 'Ville', sortable: true },
    { 
      key: 'status', 
      label: 'Statut',
      render: (value: string) => {
        const variant = value === 'active' ? 'success' : 'default';
        return <Badge variant={variant}>{value === 'active' ? 'Actif' : 'Inactif'}</Badge>;
      }
    },
  ];
  
  return (
    <Layout 
      title="Design System - Composants UI"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Composants' }
      ]}
      activeNav="dashboard"
    >
      <div class="space-y-8">
        
        {/* Buttons Section */}
        <Card title="Buttons" subtitle="Different button variants and sizes">
          <div class="space-y-4">
            <div class="flex flex-wrap gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="success">Success</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="outline">Outline</Button>
            </div>
            
            <div class="flex flex-wrap gap-3">
              <Button size="sm" icon="fas fa-plus">Small Button</Button>
              <Button size="md" icon="fas fa-save">Medium Button</Button>
              <Button size="lg" icon="fas fa-check">Large Button</Button>
            </div>
            
            <div class="flex flex-wrap gap-3">
              <Button loading>Loading...</Button>
              <Button disabled>Disabled</Button>
              <Button fullWidth variant="primary" icon="fas fa-download">
                Full Width Button
              </Button>
            </div>
          </div>
        </Card>
        
        {/* Form Inputs Section */}
        <Card title="Form Inputs" subtitle="Input fields with validation">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              name="username"
              label="Nom d'utilisateur"
              placeholder="Entrez votre nom"
              icon="fas fa-user"
              required
            />
            
            <Input 
              name="email"
              type="email"
              label="Email"
              placeholder="exemple@email.com"
              icon="fas fa-envelope"
              helper="Votre adresse email professionnelle"
            />
            
            <Input 
              name="password"
              type="password"
              label="Mot de passe"
              placeholder="••••••••"
              icon="fas fa-lock"
              error="Le mot de passe doit contenir au moins 8 caractères"
            />
            
            <Input 
              name="phone"
              type="tel"
              label="Téléphone"
              placeholder="+212 6XX XXX XXX"
              icon="fas fa-phone"
            />
          </div>
        </Card>
        
        {/* Select & Textarea Section */}
        <Card title="Select & Textarea" subtitle="Dropdown and text area components">
          <div class="space-y-4">
            <Select 
              name="city"
              label="Ville"
              options={[
                { value: 'casa', label: 'Casablanca' },
                { value: 'rabat', label: 'Rabat' },
                { value: 'marrakech', label: 'Marrakech' },
                { value: 'fes', label: 'Fès' },
              ]}
              placeholder="Sélectionnez une ville"
              required
            />
            
            <Textarea 
              name="comments"
              label="Commentaires"
              placeholder="Ajoutez vos commentaires ici..."
              rows={4}
              maxLength={500}
              showCount
              helper="Maximum 500 caractères"
            />
            
            <div class="space-y-2">
              <Checkbox 
                name="terms"
                label="J'accepte les termes et conditions"
                required
              />
              <Checkbox 
                name="newsletter"
                label="Je souhaite recevoir la newsletter"
              />
              <Checkbox 
                name="disabled"
                label="Option désactivée"
                disabled
                checked
              />
            </div>
          </div>
        </Card>
        
        {/* Table Section */}
        <Card title="Table" subtitle="Data table with pagination">
          <Table 
            columns={tableColumns}
            data={sampleData}
            striped
            hoverable
            onRowClick="handleRowClick"
          />
        </Card>
        
        {/* Badges Section */}
        <Card title="Badges" subtitle="Status badges and labels">
          <div class="flex flex-wrap gap-3">
            <Badge variant="default">Default</Badge>
            <Badge variant="primary">Primary</Badge>
            <Badge variant="success" icon="fas fa-check">Success</Badge>
            <Badge variant="warning" icon="fas fa-exclamation">Warning</Badge>
            <Badge variant="danger" icon="fas fa-times">Danger</Badge>
            <Badge variant="info" icon="fas fa-info">Info</Badge>
            <Badge variant="success" rounded>12</Badge>
            <Badge variant="danger" rounded>99+</Badge>
          </div>
        </Card>
        
        {/* Toasts & Modals Section */}
        <Card title="Interactive Components" subtitle="Toasts and modals">
          <div class="flex flex-wrap gap-3">
            <Button 
              variant="primary" 
              icon="fas fa-check"
              onClick="showToast('Opération réussie !', 'success')"
            >
              Toast Success
            </Button>
            <Button 
              variant="danger" 
              icon="fas fa-times"
              onClick="showToast('Une erreur est survenue', 'error')"
            >
              Toast Error
            </Button>
            <Button 
              variant="secondary" 
              icon="fas fa-info"
              onClick="showToast('Information importante', 'info')"
            >
              Toast Info
            </Button>
            <Button 
              icon="fas fa-window-maximize"
              onClick="openModal('demo-modal')"
            >
              Ouvrir Modal
            </Button>
          </div>
        </Card>
        
      </div>
      
      {/* Demo Modal */}
      <Modal 
        id="demo-modal"
        title="Modal de Démonstration"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick="closeModal('demo-modal')">
              Annuler
            </Button>
            <Button variant="primary" onClick="closeModal('demo-modal'); showToast('Action confirmée', 'success')">
              Confirmer
            </Button>
          </>
        }
      >
        <p class="text-gray-700 mb-4">
          Ceci est un exemple de modal avec titre, contenu et footer personnalisable.
        </p>
        <Input 
          name="modal-input"
          label="Exemple d'input dans un modal"
          placeholder="Entrez du texte..."
        />
      </Modal>
      
      {/* JavaScript for demo interactions */}
      <script dangerouslySetInnerHTML={{
        __html: `
          function handleRowClick(rowId) {
            showToast('Ligne ' + rowId + ' cliquée', 'info');
          }
        `
      }}></script>
    </Layout>
  );
};
