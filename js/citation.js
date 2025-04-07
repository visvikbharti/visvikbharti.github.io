/**
 * Citation generator for publications
 * Add this code to your main.js file or include as a separate script
 */

// Citation data for each publication
const citationData = {
    // TRIPinRNA paper
    'Rakheja2024TRIPinRNA': {
        apa: 'Rakheja, I., Bharti, V., et al. (2024). Development of an In Silico Platform (TRIPinRNA) for the Identification of Novel RNA Intramolecular Triple Helices and Their Validation Using Biophysical Techniques. Biochemistry. https://doi.org/10.1021/acs.biochem.4c00334',
        mla: 'Rakheja, Isha, Vishal Bharti, et al. "Development of an In Silico Platform (TRIPinRNA) for the Identification of Novel RNA Intramolecular Triple Helices and Their Validation Using Biophysical Techniques." Biochemistry, 2024. doi:10.1021/acs.biochem.4c00334.',
        bibtex: `@article{Rakheja2024TRIPinRNA,
  author = {Rakheja, Isha and Bharti, Vishal and [Other Authors]},
  title = {Development of an In Silico Platform (TRIPinRNA) for the Identification of Novel RNA Intramolecular Triple Helices and Their Validation Using Biophysical Techniques},
  journal = {Biochemistry},
  year = {2024},
  doi = {10.1021/acs.biochem.4c00334}
}`
    },
    
    // IGF2BP1 paper
    'Rana2024IGF2BP1': {
        apa: 'Rana, P., Rajat, U., Bharti, V., et al. (2024). IGF2BP1-Mediated Regulation of CCN1 Expression by Specific Binding to G-Quadruplex Structure in its 3´UTR. Biochemistry. https://doi.org/10.1021/acs.biochem.4c00172',
        mla: 'Rana, P., et al. "IGF2BP1-Mediated Regulation of CCN1 Expression by Specific Binding to G-Quadruplex Structure in its 3´UTR." Biochemistry, 2024. doi:10.1021/acs.biochem.4c00172.',
        bibtex: `@article{Rana2024IGF2BP1,
  author = {Rana, P. and Rajat, U. and Bharti, V. and [Other Authors]},
  title = {IGF2BP1-Mediated Regulation of CCN1 Expression by Specific Binding to G-Quadruplex Structure in its 3´UTR},
  journal = {Biochemistry},
  year = {2024},
  doi = {10.1021/acs.biochem.4c00172}
}`
    },
    
    // Forebrain paper
    'Rauthan2024Forebrain': {
        apa: 'Rauthan, R., Bharti, V., et al. (2024). An Interface of Genetically Engineered Human Forebrain Assembloids and Polymeric Nanofiber Scaffolds for Multiscale Profiling of Interneuron Migration Disorders. Preprint. https://doi.org/10.21203/rs.3.rs-3831019/v1',
        mla: 'Rauthan, R., Vishal Bharti, et al. "An Interface of Genetically Engineered Human Forebrain Assembloids and Polymeric Nanofiber Scaffolds for Multiscale Profiling of Interneuron Migration Disorders." Preprint, 2024. doi:10.21203/rs.3.rs-3831019/v1.',
        bibtex: `@article{Rauthan2024Forebrain,
  author = {Rauthan, R. and Bharti, V. and [Other Authors]},
  title = {An Interface of Genetically Engineered Human Forebrain Assembloids and Polymeric Nanofiber Scaffolds for Multiscale Profiling of Interneuron Migration Disorders},
  journal = {Preprint},
  year = {2024},
  doi = {10.21203/rs.3.rs-3831019/v1}
}`
    },
    
    // MLC1 paper
    'Sharma2025MLC1': {
        apa: 'Sharma, S., Bharti, V., Das, P.K., et al. (2025). MLC1 alteration in iPSCs give rise to disease-like cellular vacuolation phenotype in the astrocyte lineage. Preprint. https://doi.org/10.1101/2025.01.06.631607',
        mla: 'Sharma, S., Vishal Bharti, P.K. Das, et al. "MLC1 alteration in iPSCs give rise to disease-like cellular vacuolation phenotype in the astrocyte lineage." Preprint, 2025. doi:10.1101/2025.01.06.631607.',
        bibtex: `@article{Sharma2025MLC1,
  author = {Sharma, S. and Bharti, V. and Das, P.K. and [Other Authors]},
  title = {MLC1 alteration in iPSCs give rise to disease-like cellular vacuolation phenotype in the astrocyte lineage},
  journal = {Preprint},
  year = {2025},
  doi = {10.1101/2025.01.06.631607}
}`
    }
};

/**
 * Display citation in the modal
 * @param {string} pubId - Publication ID
 */
function citationModal(pubId) {
    const modal = document.getElementById('citation-modal');
    const citationText = document.getElementById('citation-text');
    const closeBtn = document.querySelector('.close-modal');
    const copyBtn = document.getElementById('copy-citation');
    const tabBtns = document.querySelectorAll('.citation-tab-btn');
    
    // Display the modal
    if (modal) {
        modal.style.display = 'block';
        
        // Show APA citation by default
        if (citationData[pubId] && citationData[pubId].apa) {
            citationText.textContent = citationData[pubId].apa;
        } else {
            citationText.textContent = 'Citation not available';
        }
        
        // Set up tab switching
        tabBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // Remove active class from all buttons
                tabBtns.forEach(b => b.classList.remove('active'));
                
                // Add active class to clicked button
                this.classList.add('active');
                
                // Show the appropriate citation format
                const format = this.getAttribute('data-format');
                if (citationData[pubId] && citationData[pubId][format]) {
                    citationText.textContent = citationData[pubId][format];
                } else {
                    citationText.textContent = 'Citation not available in this format';
                }
            });
        });
        
        // Close the modal when clicking the close button
        if (closeBtn) {
            closeBtn.onclick = function() {
                modal.style.display = 'none';
            };
        }
        
        // Close the modal when clicking outside of it
        window.onclick = function(event) {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        };
        
        // Copy citation to clipboard
        if (copyBtn) {
            copyBtn.onclick = function() {
                const text = citationText.textContent;
                navigator.clipboard.writeText(text).then(
                    function() {
                        // Show success message
                        const originalText = copyBtn.innerHTML;
                        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                        setTimeout(function() {
                            copyBtn.innerHTML = originalText;
                        }, 2000);
                    },
                    function() {
                        alert('Failed to copy');
                    }
                );
            };
        }
    }
}

// Add styles for the citation modal if not already in your CSS
document.addEventListener('DOMContentLoaded', function() {
    // Only add these styles if they're not already present
    if (!document.getElementById('citation-modal-styles')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'citation-modal-styles';
        styleElement.textContent = `
            .modal {
                display: none;
                position: fixed;
                z-index: 1000;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                overflow: auto;
                background-color: rgba(0,0,0,0.4);
            }
            
            .modal-content {
                background-color: #fefefe;
                margin: 10% auto;
                padding: 20px;
                border: 1px solid #888;
                width: 80%;
                max-width: 700px;
                border-radius: 5px;
                box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                position: relative;
            }
            
            .close-modal {
                color: #aaa;
                float: right;
                font-size: 28px;
                font-weight: bold;
                cursor: pointer;
                position: absolute;
                top: 10px;
                right: 20px;
            }
            
            .close-modal:hover {
                color: black;
            }
            
            .citation-tabs {
                display: flex;
                margin: 20px 0 10px;
                border-bottom: 1px solid #ddd;
            }
            
            .citation-tab-btn {
                background: none;
                border: none;
                padding: 10px 15px;
                cursor: pointer;
                font-weight: bold;
                opacity: 0.7;
            }
            
            .citation-tab-btn.active {
                opacity: 1;
                border-bottom: 2px solid #3498db;
            }
            
            .citation-text {
                padding: 15px;
                background-color: #f8f9fa;
                border-radius: 5px;
                margin: 15px 0;
                white-space: pre-wrap;
                font-family: monospace;
                max-height: 250px;
                overflow-y: auto;
            }
            
            body.dark-mode .modal-content {
                background-color: #222;
                color: #f0f0f0;
            }
            
            body.dark-mode .citation-text {
                background-color: #2c3e50;
            }
            
            body.dark-mode .close-modal {
                color: #f0f0f0;
            }
            
            body.dark-mode .citation-tab-btn {
                color: #f0f0f0;
            }
        `;
        document.head.appendChild(styleElement);
    }
});