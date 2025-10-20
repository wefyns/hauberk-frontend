import { useOrganization } from "../../contexts/useOrganization";
import styles from "../Home.module.css";

function HomePage() {
  const { selectedOrganization } = useOrganization();
  
  return (
    <div className={styles.sectionContent}>
      <h2>Welcome to {selectedOrganization?.name}</h2>
      <p>Select a section from the sidebar to get started.</p>
    </div>
  );
}

export default HomePage;
